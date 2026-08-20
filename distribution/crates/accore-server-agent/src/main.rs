use std::{
    env,
    fs::{self, File},
    io::{Read, Write},
    net::TcpStream,
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};

mod windows_service_host;

const DATABASE_PORT: u16 = 3307;
const API_PORT: u16 = 8765;
const READINESS_TIMEOUT: Duration = Duration::from_secs(90);
const MAX_RESTART_ATTEMPTS: u8 = 3;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeConfig {
    runtime_root: PathBuf,
    data_root: PathBuf,
    app_key: String,
    database_password: String,
    database_name: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ComponentStatus {
    state: String,
    detail: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeStatus {
    state: String,
    detail: String,
    database: ComponentStatus,
    api: ComponentStatus,
    queue: ComponentStatus,
    updated_at: u64,
}

impl RuntimeStatus {
    fn bootstrapping(detail: impl Into<String>) -> Self {
        Self {
            state: "bootstrapping".into(),
            detail: detail.into(),
            database: component("pending", "not started"),
            api: component("pending", "not started"),
            queue: component("pending", "not started"),
            updated_at: now(),
        }
    }

    fn failed(&mut self, detail: impl Into<String>) {
        self.state = "unhealthy".into();
        self.detail = detail.into();
        self.updated_at = now();
    }
}

fn main() {
    if let Err(error) = execute() {
        eprintln!("ACCORE Server Agent failed: {error}");
        std::process::exit(1);
    }
}

fn execute() -> Result<(), String> {
    let mut arguments = env::args().skip(1);
    let command = arguments.next().ok_or(
        "usage: accore-server-agent <run|service|install|uninstall|status|stop> --config <path>",
    )?;
    let flag = arguments.next().ok_or("missing --config")?;
    let config_path = arguments.next().ok_or("missing config path")?;
    if flag != "--config" {
        return Err("usage: accore-server-agent <run|service|install|uninstall|status|stop> --config <path>".into());
    }

    match command.as_str() {
        "run" => execute_with_config(Path::new(&config_path)),
        "service" => windows_service_host::run_service(config_path),
        "install" => windows_service_host::install_service(config_path),
        "uninstall" => windows_service_host::uninstall_service(),
        "status" => print_status(&load_config(Path::new(&config_path))?),
        "stop" => request_stop_for_config(Path::new(&config_path)),
        _ => Err(format!("unsupported command {command}")),
    }
}

fn execute_with_config(path: &Path) -> Result<(), String> {
    run(load_config(path)?)
}

fn run(config: RuntimeConfig) -> Result<(), String> {
    ensure_layout(&config)?;
    let mut status = RuntimeStatus::bootstrapping("preparing durable local runtime");
    write_status(&config, &status)?;

    let mut restart_attempts = 0;
    loop {
        match run_components(&config, &mut status) {
            Ok(()) => return Ok(()),
            Err(error) => {
                restart_attempts += 1;
                if restart_attempts > MAX_RESTART_ATTEMPTS {
                    status.failed(format!(
                        "local server stopped after {MAX_RESTART_ATTEMPTS} recovery attempts: {error}"
                    ));
                    let _ = write_status(&config, &status);
                    return Err(error);
                }

                let delay = Duration::from_secs(u64::from(restart_attempts) * 2);
                status.state = "recovering".into();
                status.detail = format!(
                    "{error}; restarting local components in {} seconds (attempt {restart_attempts}/{MAX_RESTART_ATTEMPTS})",
                    delay.as_secs()
                );
                status.database = component("recovering", "waiting for controlled restart");
                status.api = component("recovering", "waiting for controlled restart");
                status.queue = component("recovering", "waiting for controlled restart");
                status.updated_at = now();
                let _ = write_status(&config, &status);
                thread::sleep(delay);
            }
        }
    }
}

fn run_components(config: &RuntimeConfig, status: &mut RuntimeStatus) -> Result<(), String> {
    let mut database = None;
    let mut api = None;
    let mut queue = None;
    let result = (|| {
        initialise_database(config)?;
        status.database = component("starting", "starting MariaDB on loopback");
        write_status(config, status)?;
        database = Some(start_database(config)?);
        wait_for_port(DATABASE_PORT, "MariaDB")?;
        provision_database_principal(config)?;
        status.database = component("ready", "MariaDB is ready on 127.0.0.1:3307");
        write_status(config, status)?;

        provision_application(config)?;
        status.api = component("starting", "starting FrankenPHP API on loopback");
        write_status(config, status)?;
        api = Some(start_api(config)?);
        wait_for_http_ok(API_PORT, "/up", "ACCORE API")?;
        status.api = component("ready", "API is ready on http://127.0.0.1:8765/up");
        write_status(config, status)?;

        status.queue = component("starting", "starting Laravel queue worker");
        write_status(config, status)?;
        queue = Some(start_queue(config)?);
        status.queue = component("ready", "queue worker is running");
        status.state = "ready".into();
        status.detail = "all local server components are ready".into();
        status.updated_at = now();
        write_status(config, status)?;

        loop {
            if stop_requested(config) {
                status.state = "stopping".into();
                status.detail = "ordered shutdown requested".into();
                write_status(config, status)?;
                terminate_optional(&mut queue);
                terminate_optional(&mut api);
                terminate_optional(&mut database);
                status.state = "stopped".into();
                status.detail = "local server stopped".into();
                status.queue = component("stopped", "queue stopped");
                status.api = component("stopped", "API stopped");
                status.database = component("stopped", "MariaDB stopped");
                write_status(config, status)?;
                return Ok(());
            }

            if let Some(reason) =
                child_exit(database.as_mut().expect("database child exists"), "MariaDB")
            {
                return Err(reason);
            }
            if let Some(reason) = child_exit(api.as_mut().expect("API child exists"), "API") {
                return Err(reason);
            }
            if let Some(reason) =
                child_exit(queue.as_mut().expect("queue child exists"), "queue worker")
            {
                return Err(reason);
            }
            thread::sleep(Duration::from_secs(2));
        }
    })();

    if result.is_err() {
        terminate_optional(&mut queue);
        terminate_optional(&mut api);
        terminate_optional(&mut database);
    }
    result
}

fn initialise_database(config: &RuntimeConfig) -> Result<(), String> {
    let marker = config.data_root.join("accoredb").join(".initialized");
    if marker.exists() {
        return Ok(());
    }
    let installer = mariadb_bin(config, "mariadb-install-db.exe");
    run_checked(
        Command::new(installer).arg(format!("--datadir={}", database_data(config).display())),
        "initialize MariaDB data directory",
    )?;
    File::create(marker)
        .map_err(|error| format!("write MariaDB initialization marker: {error}"))?;
    Ok(())
}

fn provision_database_principal(config: &RuntimeConfig) -> Result<(), String> {
    let marker = config
        .data_root
        .join("accoredb")
        .join(".principal-provisioned");
    if marker.exists() {
        return Ok(());
    }
    let database = &config.database_name;
    let password = &config.database_password;
    let sql = format!(
        "CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; \
         CREATE USER IF NOT EXISTS 'accore_app'@'localhost' IDENTIFIED BY '{password}'; \
         CREATE USER IF NOT EXISTS 'accore_app'@'127.0.0.1' IDENTIFIED BY '{password}'; \
         GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES ON `{database}`.* TO 'accore_app'@'localhost'; \
         GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES ON `{database}`.* TO 'accore_app'@'127.0.0.1'; \
         FLUSH PRIVILEGES;"
    );
    run_checked(
        Command::new(mariadb_bin(config, "mariadb.exe"))
            .args(["--protocol=tcp", "--host=127.0.0.1"])
            .arg(format!("--port={DATABASE_PORT}"))
            .args(["--user=root", "--execute"])
            .arg(sql),
        "provision ACCORE database principal",
    )?;
    File::create(marker).map_err(|error| format!("write database principal marker: {error}"))?;
    Ok(())
}

fn start_database(config: &RuntimeConfig) -> Result<Child, String> {
    let log = File::create(log_path(config, "mariadb.log"))
        .map_err(|error| format!("open MariaDB log: {error}"))?;
    Command::new(mariadb_bin(config, "mariadbd.exe"))
        .arg(format!("--datadir={}", database_data(config).display()))
        .arg("--bind-address=127.0.0.1")
        .arg(format!("--port={DATABASE_PORT}"))
        .arg("--skip-name-resolve")
        .stdout(Stdio::from(
            log.try_clone()
                .map_err(|error| format!("clone MariaDB log: {error}"))?,
        ))
        .stderr(Stdio::from(log))
        .spawn()
        .map_err(|error| format!("start MariaDB: {error}"))
}

fn provision_application(config: &RuntimeConfig) -> Result<(), String> {
    let env_path = app_root(config).join(".env");
    let storage_path = config
        .data_root
        .join("laravel-storage")
        .display()
        .to_string()
        .replace('\\', "/");
    let body = format!(
        "APP_NAME=ACCORE ERP\nAPP_ENV=production\nAPP_KEY={}\nAPP_DEBUG=false\nAPP_URL=http://127.0.0.1:{API_PORT}\nLARAVEL_STORAGE_PATH={storage_path}\nLOG_CHANNEL=single\nLOG_LEVEL=info\nDB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_PORT={DATABASE_PORT}\nDB_DATABASE={}\nDB_USERNAME=accore_app\nDB_PASSWORD={}\nSESSION_DRIVER=file\nCACHE_STORE=file\nQUEUE_CONNECTION=database\n",
        config.app_key, config.database_name, config.database_password
    );
    fs::write(env_path, body).map_err(|error| format!("write Laravel environment: {error}"))?;

    let mut migrate = application_command(config, ["php-cli", "artisan", "migrate", "--force"]);
    run_checked(&mut migrate, "run Laravel migrations")?;
    let mut cache = application_command(config, ["php-cli", "artisan", "config:cache"]);
    run_checked(&mut cache, "cache Laravel configuration")
}

fn start_api(config: &RuntimeConfig) -> Result<Child, String> {
    let log = File::create(log_path(config, "api.log"))
        .map_err(|error| format!("open API log: {error}"))?;
    let mut command = Command::new(frankenphp(config));
    command
        .args(["run", "--config"])
        .arg(config.runtime_root.join("Caddyfile"))
        .current_dir(app_root(config))
        .env("ACCORE_APP_ROOT", app_root(config))
        .env("APP_ENV", "production")
        .stdout(Stdio::from(
            log.try_clone()
                .map_err(|error| format!("clone API log: {error}"))?,
        ))
        .stderr(Stdio::from(log));
    command
        .spawn()
        .map_err(|error| format!("start FrankenPHP API: {error}"))
}

fn start_queue(config: &RuntimeConfig) -> Result<Child, String> {
    let log = File::create(log_path(config, "queue.log"))
        .map_err(|error| format!("open queue log: {error}"))?;
    let mut command = application_command(
        config,
        [
            "php-cli",
            "artisan",
            "queue:work",
            "--sleep=1",
            "--tries=3",
            "--timeout=90",
        ],
    );
    command
        .stdout(Stdio::from(
            log.try_clone()
                .map_err(|error| format!("clone queue log: {error}"))?,
        ))
        .stderr(Stdio::from(log));
    command
        .spawn()
        .map_err(|error| format!("start queue worker: {error}"))
}

fn application_command<const N: usize>(config: &RuntimeConfig, arguments: [&str; N]) -> Command {
    let mut command = Command::new(frankenphp(config));
    command
        .args(arguments)
        .current_dir(app_root(config))
        .env("APP_ENV", "production");
    command
}

fn wait_for_port(port: u16, component: &str) -> Result<(), String> {
    let started = std::time::Instant::now();
    while started.elapsed() < READINESS_TIMEOUT {
        if TcpStream::connect(("127.0.0.1", port)).is_ok() {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(500));
    }
    Err(format!(
        "{component} did not become ready within {} seconds",
        READINESS_TIMEOUT.as_secs()
    ))
}

fn wait_for_http_ok(port: u16, path: &str, component: &str) -> Result<(), String> {
    let started = std::time::Instant::now();
    while started.elapsed() < READINESS_TIMEOUT {
        if let Ok(mut stream) = TcpStream::connect(("127.0.0.1", port)) {
            let _ = stream.set_read_timeout(Some(Duration::from_secs(2)));
            let request =
                format!("GET {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
            if stream.write_all(request.as_bytes()).is_ok() {
                let mut response = String::new();
                if stream.read_to_string(&mut response).is_ok()
                    && (response.starts_with("HTTP/1.1 200")
                        || response.starts_with("HTTP/1.0 200"))
                {
                    return Ok(());
                }
            }
        }
        thread::sleep(Duration::from_millis(500));
    }
    Err(format!(
        "{component} did not return HTTP 200 from {path} within {} seconds",
        READINESS_TIMEOUT.as_secs()
    ))
}

fn run_checked(command: &mut Command, description: &str) -> Result<(), String> {
    let output = command
        .output()
        .map_err(|error| format!("{description}: {error}"))?;
    if output.status.success() {
        Ok(())
    } else {
        Err(format!(
            "{description} exited with {}: {}",
            output.status,
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

fn child_exit(child: &mut Child, component: &str) -> Option<String> {
    match child.try_wait() {
        Ok(Some(status)) => Some(format!("{component} exited unexpectedly with {status}")),
        Ok(None) => None,
        Err(error) => Some(format!("could not inspect {component}: {error}")),
    }
}

fn terminate(child: &mut Child) {
    let _ = child.kill();
    let _ = child.wait();
}

fn terminate_optional(child: &mut Option<Child>) {
    if let Some(child) = child.as_mut() {
        terminate(child);
    }
}

fn print_status(config: &RuntimeConfig) -> Result<(), String> {
    let status = fs::read_to_string(status_path(config))
        .map_err(|error| format!("read runtime status: {error}"))?;
    print!("{status}");
    Ok(())
}

fn write_status(config: &RuntimeConfig, status: &RuntimeStatus) -> Result<(), String> {
    let destination = status_path(config);
    let temporary = destination.with_extension("json.partial");
    let payload = serde_json::to_vec_pretty(status)
        .map_err(|error| format!("serialize runtime status: {error}"))?;
    fs::write(&temporary, payload).map_err(|error| format!("write runtime status: {error}"))?;
    fs::rename(&temporary, &destination).map_err(|error| format!("publish runtime status: {error}"))
}

fn request_stop(config: &RuntimeConfig) -> Result<(), String> {
    fs::write(config.data_root.join("control.stop"), "requested\n")
        .map_err(|error| format!("request runtime stop: {error}"))
}

fn request_stop_for_config(path: &Path) -> Result<(), String> {
    request_stop(&load_config(path)?)
}

fn stop_requested(config: &RuntimeConfig) -> bool {
    let path = config.data_root.join("control.stop");
    if path.exists() {
        let _ = fs::remove_file(path);
        true
    } else {
        false
    }
}

fn ensure_layout(config: &RuntimeConfig) -> Result<(), String> {
    for path in [
        config.data_root.join("accoredb").join("data"),
        config.data_root.join("laravel-storage"),
        config.data_root.join("logs"),
        config.data_root.join("backups"),
    ] {
        fs::create_dir_all(path).map_err(|error| format!("create runtime directory: {error}"))?;
    }
    Ok(())
}

fn app_root(config: &RuntimeConfig) -> PathBuf {
    config.runtime_root.join("app")
}
fn database_data(config: &RuntimeConfig) -> PathBuf {
    config.data_root.join("accoredb").join("data")
}
fn mariadb_bin(config: &RuntimeConfig, name: &str) -> PathBuf {
    config
        .runtime_root
        .join("mariadb-11.4.9-winx64")
        .join("bin")
        .join(name)
}
fn frankenphp(config: &RuntimeConfig) -> PathBuf {
    config.runtime_root.join("frankenphp.exe")
}
fn status_path(config: &RuntimeConfig) -> PathBuf {
    config.data_root.join("runtime-status.json")
}
fn log_path(config: &RuntimeConfig, name: &str) -> PathBuf {
    config.data_root.join("logs").join(name)
}
fn component(state: impl Into<String>, detail: impl Into<String>) -> ComponentStatus {
    ComponentStatus {
        state: state.into(),
        detail: detail.into(),
    }
}
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|value| value.as_secs())
        .unwrap_or_default()
}

fn load_config(path: &Path) -> Result<RuntimeConfig, String> {
    serde_json::from_slice(
        &fs::read(path).map_err(|error| format!("read runtime config: {error}"))?,
    )
    .map_err(|error| format!("parse runtime config: {error}"))
}
