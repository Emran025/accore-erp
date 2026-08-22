use std::{
    env,
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    net::TcpStream,
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    thread,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

#[cfg(windows)]
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
#[cfg(windows)]
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};

mod backup;
mod windows_service_host;

const DATABASE_PORT: u16 = 3307;
const API_PORT: u16 = 8765;
const BACKUP_VALIDATION_PORT: u16 = 3308;
const READINESS_TIMEOUT: Duration = Duration::from_secs(90);
const PROVISIONING_COMMAND_TIMEOUT: Duration = Duration::from_secs(5 * 60);
const MAX_RESTART_ATTEMPTS: u8 = 3;
const BACKUP_INTERVAL_SECONDS: u64 = 6 * 60 * 60;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeConfig {
    runtime_root: PathBuf,
    data_root: PathBuf,
    app_key: String,
    database_password: String,
    #[serde(default)]
    database_root_password: String,
    #[serde(default)]
    database_root_password_legacy_blank: bool,
    database_name: String,
    #[serde(default)]
    server_id: String,
    #[serde(default = "default_server_name")]
    server_name: String,
    #[serde(default)]
    public_api_base: String,
    #[serde(default)]
    certificate_fingerprint: String,
    #[serde(default)]
    direct_tls_enabled: bool,
    #[serde(default)]
    allowed_remote_addresses: Vec<String>,
    #[serde(default)]
    tls_certificate_path: String,
    #[serde(default)]
    tls_private_key_path: String,
    #[serde(default = "default_direct_tls_port")]
    direct_tls_port: u16,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InstallResponse {
    #[serde(default)]
    server_name: Option<String>,
    #[serde(default)]
    public_api_base: Option<String>,
    #[serde(default)]
    certificate_fingerprint: Option<String>,
    #[serde(default)]
    tls_certificate_path: Option<String>,
    #[serde(default)]
    tls_private_key_path: Option<String>,
    #[serde(default)]
    allowed_remote_addresses: Option<Vec<String>>,
    #[serde(default)]
    direct_tls_port: Option<u16>,
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
    server_id: String,
    database: ComponentStatus,
    api: ComponentStatus,
    queue: ComponentStatus,
    backup: ComponentStatus,
    updated_at: u64,
}

impl RuntimeStatus {
    fn bootstrapping(config: &RuntimeConfig, detail: impl Into<String>) -> Self {
        Self {
            state: "bootstrapping".into(),
            detail: detail.into(),
            server_id: config.server_id.clone(),
            database: component("pending", "not started"),
            api: component("pending", "not started"),
            queue: component("pending", "not started"),
            backup: component("pending", "backup policy not yet active"),
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
        "usage: accore-server-agent <run|service|install|uninstall|status|stop|request-backup|seed-baseline> [--config <path>]",
    )?;

    match command.as_str() {
        "install" => install_embedded_service(read_install_response(&mut arguments)?),
        "uninstall" => uninstall_embedded_service(),
        "stop" => windows_service_host::stop_service(),
        "run" | "service" | "status" | "request-backup" | "seed-baseline" | "issue-initial-pairing" => {
            let config_path = read_config_argument(&mut arguments)?;
            match command.as_str() {
                "run" => execute_with_config(Path::new(&config_path)),
                "service" => windows_service_host::run_service(config_path),
                "status" => print_status(&load_config(Path::new(&config_path))?),
                "request-backup" => request_backup_for_config(Path::new(&config_path)),
                "seed-baseline" => recover_baseline_seed_for_config(Path::new(&config_path)),
                "issue-initial-pairing" => issue_initial_pairing_for_config(Path::new(&config_path), false),
                _ => unreachable!(),
            }
        }
        _ => Err(format!("unsupported command {command}")),
    }
}

fn read_install_response(arguments: &mut impl Iterator<Item = String>) -> Result<InstallResponse, String> {
    let Some(flag) = arguments.next() else {
        return Ok(InstallResponse::default());
    };
    if flag != "--response-file" {
        return Err("usage: accore-server-agent install [--response-file <path>]".into());
    }
    let path = arguments.next().ok_or("missing response file path")?;
    if arguments.next().is_some() {
        return Err("usage: accore-server-agent install [--response-file <path>]".into());
    }

    let response: InstallResponse = serde_json::from_slice(
        &fs::read(&path).map_err(|error| format!("read non-interactive response file: {error}"))?,
    )
    .map_err(|error| format!("parse non-interactive response file: {error}"))?;
    validate_install_response(&response)?;
    Ok(response)
}

fn read_config_argument(arguments: &mut impl Iterator<Item = String>) -> Result<String, String> {
    let flag = arguments.next().ok_or("missing --config")?;
    let config_path = arguments.next().ok_or("missing config path")?;
    if flag != "--config" {
        return Err("usage: accore-server-agent <run|service|status> --config <path>".into());
    }
    Ok(config_path)
}

fn default_server_name() -> String {
    "ACCORE ERP Server".into()
}

fn default_direct_tls_port() -> u16 {
    8766
}

fn validate_install_response(response: &InstallResponse) -> Result<(), String> {
    if let Some(name) = &response.server_name {
        if name.trim().is_empty() || name.trim().len() > 120 {
            return Err("serverName must contain between 1 and 120 visible characters".into());
        }
    }

    match (
        &response.public_api_base,
        &response.certificate_fingerprint,
        &response.tls_certificate_path,
        &response.tls_private_key_path,
        &response.allowed_remote_addresses,
        &response.direct_tls_port,
    ) {
        (None, None, None, None, None, None) => Ok(()),
        (Some(api_base), Some(fingerprint), Some(certificate_path), Some(private_key_path), Some(addresses), direct_tls_port) => {
            let normalized_api_base = api_base.trim();
            if !normalized_api_base.starts_with("https://")
                || normalized_api_base
                    .chars()
                    .any(|character| matches!(character, '?' | '#' | '@' | ' '))
            {
                return Err("publicApiBase must be a canonical https endpoint without credentials, query, fragment, or spaces".into());
            }
            if fingerprint.trim().len() != 64
                || !fingerprint.trim().bytes().all(|byte| byte.is_ascii_hexdigit())
            {
                return Err("certificateFingerprint must contain exactly 64 hexadecimal characters".into());
            }
            if certificate_path.trim().is_empty() || private_key_path.trim().is_empty() {
                return Err("TLS certificate and private key paths must both be provided".into());
            }
            if addresses.is_empty() || addresses.iter().any(|address| !is_safe_firewall_address(address)) {
                return Err("allowedRemoteAddresses must contain explicit IP addresses or CIDR ranges only".into());
            }
            let port = direct_tls_port.unwrap_or(default_direct_tls_port());
            if port < 1024 || matches!(port, DATABASE_PORT | BACKUP_VALIDATION_PORT | API_PORT) {
                return Err("directTlsPort must be an unreserved non-privileged TCP port".into());
            }
            Ok(())
        }
        _ => Err("remote publishing requires publicApiBase, certificateFingerprint, TLS certificate, TLS private key, and allowedRemoteAddresses together".into()),
    }
}

fn is_safe_firewall_address(value: &str) -> bool {
    let candidate = value.trim();
    !candidate.is_empty()
        && candidate.len() <= 64
        && candidate
            .bytes()
            .all(|byte| byte.is_ascii_hexdigit() || matches!(byte, b'.' | b':' | b'/' | b'*'))
}

fn apply_install_response(config: &mut RuntimeConfig, response: InstallResponse) -> Result<(), String> {
    validate_install_response(&response)?;
    if let Some(name) = response.server_name {
        config.server_name = name.trim().into();
    }
    if let (
        Some(api_base),
        Some(fingerprint),
        Some(certificate_path),
        Some(private_key_path),
        Some(addresses),
    ) = (
        response.public_api_base,
        response.certificate_fingerprint,
        response.tls_certificate_path,
        response.tls_private_key_path,
        response.allowed_remote_addresses,
    ) {
        let tls_root = config.data_root.join("tls");
        fs::create_dir_all(&tls_root)
            .map_err(|error| format!("create protected TLS directory: {error}"))?;
        let certificate_destination = tls_root.join("server-certificate.pem");
        let private_key_destination = tls_root.join("server-private-key.pem");
        copy_private_file(Path::new(&certificate_path), &certificate_destination, "TLS certificate")?;
        copy_private_file(Path::new(&private_key_path), &private_key_destination, "TLS private key")?;

        #[cfg(windows)]
        apply_windows_acl(&tls_root, false)?;
        config.public_api_base = api_base.trim_end_matches('/').into();
        config.certificate_fingerprint = fingerprint.trim().to_ascii_lowercase();
        config.direct_tls_enabled = true;
        config.allowed_remote_addresses = addresses;
        config.tls_certificate_path = certificate_destination.display().to_string();
        config.tls_private_key_path = private_key_destination.display().to_string();
        config.direct_tls_port = response.direct_tls_port.unwrap_or(default_direct_tls_port());
    }
    Ok(())
}

fn copy_private_file(source: &Path, destination: &Path, label: &str) -> Result<(), String> {
    if !source.is_file() {
        return Err(format!("{label} source file does not exist"));
    }
    if source != destination {
        fs::copy(source, destination).map_err(|error| format!("copy {label} into protected storage: {error}"))?;
    }
    Ok(())
}

fn install_embedded_service(response: InstallResponse) -> Result<(), String> {
    #[cfg(windows)]
    {
        let config_path = default_config_path()?;
        let mut config = embedded_runtime_config()?;
        if config_path.is_file() {
            let existing = load_config(&config_path)?;
            config.app_key = existing.app_key;
            config.database_password = existing.database_password;
            if existing.database_root_password.is_empty() {
                config.database_root_password_legacy_blank = true;
            } else {
                config.database_root_password = existing.database_root_password;
            }
            config.database_name = existing.database_name;
            if !existing.server_id.is_empty() {
                config.server_id = existing.server_id;
            }
            config.server_name = existing.server_name;
            config.public_api_base = existing.public_api_base;
            config.certificate_fingerprint = existing.certificate_fingerprint;
            config.direct_tls_enabled = existing.direct_tls_enabled;
            config.allowed_remote_addresses = existing.allowed_remote_addresses;
            config.tls_certificate_path = existing.tls_certificate_path;
            config.tls_private_key_path = existing.tls_private_key_path;
            config.direct_tls_port = existing.direct_tls_port;
        }
        apply_install_response(&mut config, response)?;
        ensure_layout(&config)?;
        harden_runtime_data_access(&config)?;
        write_config(&config_path, &config)?;
        sync_remote_firewall_rule(&config)?;
        windows_service_host::install_service(config_path.display().to_string())
    }

    #[cfg(not(windows))]
    {
        Err("self-contained Server Desktop installation is supported only on Windows x64".into())
    }
}

fn uninstall_embedded_service() -> Result<(), String> {
    #[cfg(windows)]
    {
        if let Ok(path) = default_config_path() {
            if path.is_file() {
                if let Ok(config) = load_config(&path) {
                    if status_path(&config).is_file() {
                        request_stop(&config)?;
                        wait_for_runtime_stop(&config)?;
                    }
                    let _ = remove_remote_firewall_rule(&config);
                }
            }
        }
        windows_service_host::uninstall_service()
    }

    #[cfg(not(windows))]
    {
        Err("self-contained Server Desktop installation is supported only on Windows x64".into())
    }
}

fn execute_with_config(path: &Path) -> Result<(), String> {
    run(load_config(path)?)
}

#[cfg(windows)]
fn execute_service_with_config(path: &Path) -> Result<(), String> {
    let config = load_config(path)?;
    ensure_layout(&config)?;
    harden_runtime_data_access(&config)?;
    run(config)
}

fn run(config: RuntimeConfig) -> Result<(), String> {
    ensure_layout(&config)?;
    let mut backup = backup::BackupRuntime::open(&config)?;
    let mut status = RuntimeStatus::bootstrapping(&config, "preparing durable local runtime");
    write_status(&config, &status)?;

    let mut restart_attempts = 0;
    loop {
        match run_components(&config, &mut status, &mut backup) {
            Ok(()) => return Ok(()),
            Err(error) => {
                if error.starts_with("initial provisioning failed:") {
                    status.failed(error.clone());
                    let _ = write_status(&config, &status);
                    return Err(error);
                }
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

fn run_components(
    config: &RuntimeConfig,
    status: &mut RuntimeStatus,
    backup: &mut backup::BackupRuntime,
) -> Result<(), String> {
    let mut database = None;
    let mut api = None;
    let mut queue = None;
    let result = (|| {
        initialise_database(config)?;
        ensure_port_is_free(DATABASE_PORT, "MariaDB")?;
        status.database = component("starting", "starting MariaDB on loopback");
        write_status(config, status)?;
        database = Some(start_database(config)?);
        wait_for_port(DATABASE_PORT, "MariaDB")?;
        ensure_child_is_running(database.as_mut().expect("database child exists"), "MariaDB")?;
        provision_database_principal(config)?;
        status.database = component("ready", "MariaDB is ready on 127.0.0.1:3307");
        write_status(config, status)?;

        provision_application(config, status)
            .map_err(|error| format!("initial provisioning failed: {error}"))?;
        ensure_port_is_free(API_PORT, "ACCORE API")?;
        status.api = component("starting", "starting FrankenPHP API on loopback");
        write_status(config, status)?;
        api = Some(start_api(config)?);
        wait_for_http_ok(API_PORT, "/up", "ACCORE API")?;
        ensure_child_is_running(api.as_mut().expect("API child exists"), "ACCORE API")?;
        status.api = component("ready", "API is ready on http://127.0.0.1:8765/up");
        write_status(config, status)?;

        status.queue = component("starting", "starting Laravel queue worker");
        write_status(config, status)?;
        queue = Some(start_queue(config)?);
        thread::sleep(Duration::from_millis(250));
        ensure_child_is_running(queue.as_mut().expect("queue child exists"), "queue worker")?;
        status.queue = component("ready", "queue worker is running");
        status.backup = backup.component_status();
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
                status.backup = component(
                    "pending",
                    "backup policy paused while local server is stopped",
                );
                write_status(config, status)?;
                return Ok(());
            }

            if let Some(next_backup_status) = backup.maintain(backup_requested(config)) {
                status.backup = next_backup_status;
                status.updated_at = now();
                write_status(config, status)?;
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
        Command::new(installer)
            .arg(format!("--datadir={}", database_data(config).display()))
            .arg(format!("--password={}", config.database_root_password))
            .arg(format!("--port={DATABASE_PORT}")),
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
    let root_marker = config
        .data_root
        .join("accoredb")
        .join(".root-credential-provisioned");
    let database = &config.database_name;
    let password = &config.database_password;
    let mut statements = Vec::new();
    if !root_marker.exists() {
        statements.push(format!(
            "ALTER USER 'root'@'localhost' IDENTIFIED BY '{}'; \
             DELETE FROM mysql.global_priv WHERE User = ''; \
             DROP DATABASE IF EXISTS test;",
            config.database_root_password
        ));
    }
    statements.push(format!(
        "CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; \
         CREATE USER IF NOT EXISTS 'accore_app'@'localhost' IDENTIFIED BY '{password}'; \
         CREATE USER IF NOT EXISTS 'accore_app'@'127.0.0.1' IDENTIFIED BY '{password}'; \
         ALTER USER 'accore_app'@'localhost' IDENTIFIED BY '{password}'; \
         ALTER USER 'accore_app'@'127.0.0.1' IDENTIFIED BY '{password}'; \
         GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES, CREATE VIEW, SHOW VIEW ON `{database}`.* TO 'accore_app'@'localhost'; \
         GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES, CREATE VIEW, SHOW VIEW ON `{database}`.* TO 'accore_app'@'127.0.0.1';"
    ));
    statements.push("FLUSH PRIVILEGES;".into());
    let source_root_password = if config.database_root_password_legacy_blank {
        ""
    } else {
        &config.database_root_password
    };
    run_checked(
        Command::new(mariadb_bin(config, "mariadb.exe"))
            .args(["--no-defaults", "--protocol=tcp", "--host=127.0.0.1"])
            .arg(format!("--port={DATABASE_PORT}"))
            .arg("--user=root")
            .arg(format!("--password={source_root_password}"))
            .arg(format!("--execute={}", statements.join(" "))),
        "provision ACCORE database principal",
    )?;
    if !marker.exists() {
        File::create(marker)
            .map_err(|error| format!("write database principal marker: {error}"))?;
    }
    if !root_marker.exists() {
        File::create(root_marker)
            .map_err(|error| format!("write root credential marker: {error}"))?;
    }
    Ok(())
}

fn start_database(config: &RuntimeConfig) -> Result<Child, String> {
    let log = File::create(log_path(config, "mariadb.log"))
        .map_err(|error| format!("open MariaDB log: {error}"))?;
    Command::new(mariadb_bin(config, "mariadbd.exe"))
        .arg("--no-defaults")
        .arg(format!(
            "--basedir={}",
            config.runtime_root.join("mariadb-11.4.9-winx64").display()
        ))
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

fn provision_application(config: &RuntimeConfig, status: &mut RuntimeStatus) -> Result<(), String> {
    let storage = config.data_root.join("laravel-storage");
    for path in [
        storage.join("app/public"),
        storage.join("framework/cache/data"),
        storage.join("framework/sessions"),
        storage.join("framework/views"),
        storage.join("logs"),
    ] {
        fs::create_dir_all(path)
            .map_err(|error| format!("create durable Laravel runtime directory: {error}"))?;
    }
    match fs::remove_file(app_root(config).join(".env")) {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => {
            return Err(format!(
                "remove legacy packaged Laravel environment: {error}"
            ))
        }
    }
    write_caddy_configuration(config)?;

    let provisioning_log = log_path(config, "provisioning.log");
    File::create(&provisioning_log)
        .map_err(|error| format!("reset Laravel provisioning log: {error}"))?;

    status.detail = "applying required Laravel migrations".into();
    write_status(config, status)?;
    let mut migrate = application_command(config, ["php-cli", "artisan", "migrate", "--force"]);
    run_checked_logged(&mut migrate, "run Laravel migrations", &provisioning_log)?;

    status.detail = "applying pending ACCORE desktop seed revisions".into();
    write_status(config, status)?;
    run_desktop_seed_revisions(config, &provisioning_log)?;
    issue_initial_pairing_for_config_data(config, true)
}

fn run_desktop_seed_revisions(config: &RuntimeConfig, provisioning_log: &Path) -> Result<(), String> {
    let seed_state_path = config.data_root.join("desktop-seed-state.json");
    let mut seed = application_command(config, ["php-cli", "artisan", "accore:desktop:seed"]);
    seed.arg("--state-path").arg(seed_state_path);
    run_checked_logged(
        &mut seed,
        "apply pending ACCORE desktop seed revisions",
        provisioning_log,
    )
}

fn start_api(config: &RuntimeConfig) -> Result<Child, String> {
    let log = File::create(log_path(config, "api.log"))
        .map_err(|error| format!("open API log: {error}"))?;
    let mut command = Command::new(frankenphp(config));
    command
        .args(["run", "--config"])
        .arg(caddy_configuration_path(config))
        .current_dir(app_root(config))
        .env("ACCORE_APP_ROOT", app_root(config))
        .envs(application_environment(config))
        .stdout(Stdio::from(
            log.try_clone()
                .map_err(|error| format!("clone API log: {error}"))?,
        ))
        .stderr(Stdio::from(log));
    command
        .spawn()
        .map_err(|error| format!("start FrankenPHP API: {error}"))
}

fn caddy_configuration_path(config: &RuntimeConfig) -> PathBuf {
    config.data_root.join("Caddyfile")
}

fn caddy_path(path: &Path) -> String {
    path.display().to_string().replace('\\', "/")
}

fn generated_caddy_configuration(config: &RuntimeConfig) -> Result<String, String> {
    let app_root = caddy_path(&app_root(config));
    let mut configuration = format!(
        "{{\n  auto_https off\n  admin off\n  frankenphp\n}}\n\nhttp://127.0.0.1:{API_PORT} {{\n  root * \"{app_root}/public\"\n  encode zstd gzip\n  php_server\n}}\n"
    );

    if config.direct_tls_enabled {
        if config.tls_certificate_path.is_empty() || config.tls_private_key_path.is_empty() {
            return Err("direct TLS is enabled without protected certificate material".into());
        }
        let certificate = caddy_path(Path::new(&config.tls_certificate_path));
        let private_key = caddy_path(Path::new(&config.tls_private_key_path));
        configuration.push_str(&format!(
            "\nhttps://0.0.0.0:{} {{\n  tls \"{}\" \"{}\"\n  root * \"{}/public\"\n  encode zstd gzip\n  php_server\n}}\n",
            config.direct_tls_port, certificate, private_key, app_root
        ));
    }

    Ok(configuration)
}

fn write_caddy_configuration(config: &RuntimeConfig) -> Result<(), String> {
    fs::write(caddy_configuration_path(config), generated_caddy_configuration(config)?)
        .map_err(|error| format!("write generated Caddy configuration: {error}"))
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
        .envs(application_environment(config));
    command
}

fn application_environment(config: &RuntimeConfig) -> Vec<(&'static str, String)> {
    let storage = config
        .data_root
        .join("laravel-storage")
        .display()
        .to_string()
        .replace('\\', "/");
    let app_url = if config.direct_tls_enabled {
        config.public_api_base.clone()
    } else {
        format!("http://127.0.0.1:{API_PORT}")
    };
    vec![
        ("APP_NAME", "ACCORE ERP".into()),
        ("APP_ENV", "production".into()),
        ("APP_KEY", config.app_key.clone()),
        ("APP_DEBUG", "false".into()),
        ("APP_URL", app_url),
        ("ACCORE_SERVER_ID", config.server_id.clone()),
        ("ACCORE_SERVER_NAME", config.server_name.clone()),
        ("ACCORE_DESKTOP_PUBLIC_API_BASE", config.public_api_base.clone()),
        ("ACCORE_SERVER_CERTIFICATE_FINGERPRINT", config.certificate_fingerprint.clone()),
        ("LARAVEL_STORAGE_PATH", storage),
        ("PHPRC", config.runtime_root.display().to_string()),
        ("LOG_CHANNEL", "single".into()),
        ("LOG_LEVEL", "info".into()),
        ("DB_CONNECTION", "mysql".into()),
        ("DB_HOST", "127.0.0.1".into()),
        ("DB_PORT", DATABASE_PORT.to_string()),
        ("DB_DATABASE", config.database_name.clone()),
        ("DB_USERNAME", "accore_app".into()),
        ("DB_PASSWORD", config.database_password.clone()),
        ("SESSION_DRIVER", "file".into()),
        ("CACHE_STORE", "file".into()),
        ("QUEUE_CONNECTION", "database".into()),
    ]
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

fn ensure_port_is_free(port: u16, component: &str) -> Result<(), String> {
    if TcpStream::connect(("127.0.0.1", port)).is_ok() {
        return Err(format!(
            "{component} cannot start because 127.0.0.1:{port} is already in use by another local process"
        ));
    }
    Ok(())
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
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        let diagnostic = if stderr.trim().is_empty() {
            stdout.trim()
        } else {
            stderr.trim()
        };
        Err(format!(
            "{description} exited with {}: {}",
            output.status, diagnostic
        ))
    }
}

fn run_checked_logged(
    command: &mut Command,
    description: &str,
    log_path: &Path,
) -> Result<(), String> {
    let mut log = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
        .map_err(|error| format!("open Laravel provisioning log: {error}"))?;
    writeln!(log, "\n=== {description} ===")
        .map_err(|error| format!("write Laravel provisioning log header: {error}"))?;
    let stdout = log
        .try_clone()
        .map_err(|error| format!("clone Laravel provisioning log: {error}"))?;
    let stderr = log
        .try_clone()
        .map_err(|error| format!("clone Laravel provisioning log: {error}"))?;
    command.stdout(Stdio::from(stdout)).stderr(Stdio::from(stderr));

    let mut child = command
        .spawn()
        .map_err(|error| format!("{description}: {error}"))?;
    let deadline = Instant::now() + PROVISIONING_COMMAND_TIMEOUT;
    loop {
        match child
            .try_wait()
            .map_err(|error| format!("inspect {description} process: {error}"))?
        {
            Some(status) if status.success() => return Ok(()),
            Some(status) => {
                return Err(format!(
                    "{description} exited with {status}; inspect {}",
                    log_path.display()
                ))
            }
            None if Instant::now() >= deadline => {
                let _ = writeln!(
                    log,
                    "{description} exceeded the bounded {}-second provisioning window.",
                    PROVISIONING_COMMAND_TIMEOUT.as_secs()
                );
                let _ = child.kill();
                let _ = child.wait();
                return Err(format!(
                    "{description} exceeded the bounded {}-second provisioning window; inspect {}",
                    PROVISIONING_COMMAND_TIMEOUT.as_secs(),
                    log_path.display()
                ));
            }
            None => thread::sleep(Duration::from_millis(250)),
        }
    }
}

fn child_exit(child: &mut Child, component: &str) -> Option<String> {
    match child.try_wait() {
        Ok(Some(status)) => Some(format!("{component} exited unexpectedly with {status}")),
        Ok(None) => None,
        Err(error) => Some(format!("could not inspect {component}: {error}")),
    }
}

fn ensure_child_is_running(child: &mut Child, component: &str) -> Result<(), String> {
    child_exit(child, component).map_or(Ok(()), Err)
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

#[cfg(windows)]
fn request_stop(config: &RuntimeConfig) -> Result<(), String> {
    fs::write(config.data_root.join("control.stop"), "requested\n")
        .map_err(|error| format!("request runtime stop: {error}"))
}

#[cfg(windows)]
fn wait_for_runtime_stop(config: &RuntimeConfig) -> Result<(), String> {
    let deadline = Instant::now() + Duration::from_secs(180);
    loop {
        if fs::read_to_string(status_path(config))
            .map(|status| status.contains("\"state\": \"stopped\""))
            .unwrap_or(false)
        {
            return Ok(());
        }
        if Instant::now() >= deadline {
            return Err("local server did not publish ordered shutdown within three minutes".into());
        }
        thread::sleep(Duration::from_millis(500));
    }
}

#[cfg(windows)]
fn request_stop_for_config(path: &Path) -> Result<(), String> {
    request_stop(&load_config(path)?)
}

fn request_backup_for_config(path: &Path) -> Result<(), String> {
    let config = load_config(path)?;
    fs::write(config.data_root.join("control.backup"), "requested\n")
        .map_err(|error| format!("request protected backup: {error}"))
}

fn recover_baseline_seed_for_config(path: &Path) -> Result<(), String> {
    let config = load_config(path)?;
    let user_count = database_scalar_count(&config, "SELECT COUNT(*) FROM users;")?;
    if user_count > 0 {
        println!("baseline seed recovery skipped: {user_count} user account(s) already exist");
        return Ok(());
    }

    let mut seed = application_command(&config, ["php-cli", "artisan", "db:seed", "--force"]);
    run_checked(&mut seed, "apply guarded ACCORE baseline seed")?;

    let active_admin_count = database_scalar_count(
        &config,
        "SELECT COUNT(*) FROM users WHERE username = 'admin' AND is_active = 1;",
    )?;
    if active_admin_count != 1 {
        return Err("guarded baseline seed completed without creating one active administrator".into());
    }

    println!("baseline seed recovery completed: active administrator account is ready");
    Ok(())
}

fn issue_initial_pairing_for_config(path: &Path, only_if_missing: bool) -> Result<(), String> {
    issue_initial_pairing_for_config_data(&load_config(path)?, only_if_missing)
}

fn issue_initial_pairing_for_config_data(config: &RuntimeConfig, only_if_missing: bool) -> Result<(), String> {
    if config.public_api_base.is_empty() || config.certificate_fingerprint.is_empty() {
        return Ok(());
    }

    let enrollment_root = config.data_root.join("enrollment");
    let package_path = enrollment_root.join("initial-primary.accorepair");
    let marker_path = enrollment_root.join(".initial-primary-issued");
    if only_if_missing && (marker_path.exists() || package_path.exists()) {
        return Ok(());
    }

    fs::create_dir_all(&enrollment_root)
        .map_err(|error| format!("create protected enrollment directory: {error}"))?;
    let mut command = application_command(
        config,
        [
            "php-cli",
            "artisan",
            "accore:desktop:issue-enrollment-evidence",
            "--purpose=primary_claim",
            "--label=initial-headless-primary",
            "--expires-in=60",
        ],
    );
    command.arg(format!("--output={}", package_path.display()));
    run_checked(&mut command, "issue initial Client Desktop pairing package")?;
    File::create(&marker_path)
        .map_err(|error| format!("write initial pairing marker: {error}"))?;

    #[cfg(windows)]
    apply_windows_acl(&enrollment_root, false)?;
    Ok(())
}

fn database_scalar_count(config: &RuntimeConfig, query: &str) -> Result<u64, String> {
    let output = Command::new(mariadb_bin(config, "mariadb.exe"))
        .args(["--no-defaults", "--protocol=tcp", "--host=127.0.0.1"])
        .arg(format!("--port={DATABASE_PORT}"))
        .arg("--user=accore_app")
        .arg(format!("--password={}", config.database_password))
        .args(["--batch", "--skip-column-names"])
        .arg(format!("--database={}", config.database_name))
        .arg(format!("--execute={query}"))
        .output()
        .map_err(|error| format!("query local ACCORE database: {error}"))?;
    if !output.status.success() {
        return Err(format!(
            "query local ACCORE database exited with {}: {}",
            output.status,
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    let raw = String::from_utf8(output.stdout)
        .map_err(|error| format!("decode local ACCORE database count: {error}"))?;
    parse_database_count(&raw)
}

fn parse_database_count(raw: &str) -> Result<u64, String> {
    raw.trim()
        .parse::<u64>()
        .map_err(|error| format!("parse local ACCORE database count '{raw}': {error}"))
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

fn backup_requested(config: &RuntimeConfig) -> bool {
    let path = config.data_root.join("control.backup");
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
        public_status_root(config),
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
    public_status_root(config).join("runtime-status.json")
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

#[cfg(windows)]
fn default_config_path() -> Result<PathBuf, String> {
    let program_data = env::var_os("PROGRAMDATA")
        .map(PathBuf::from)
        .ok_or("PROGRAMDATA is not available")?;
    Ok(program_data
        .join("ACCORE ERP")
        .join("Server")
        .join("agent-config.json"))
}

#[cfg(windows)]
fn embedded_runtime_config() -> Result<RuntimeConfig, String> {
    let executable =
        env::current_exe().map_err(|error| format!("resolve Agent executable: {error}"))?;
    let installation_root = executable
        .parent()
        .ok_or("resolve Server Desktop installation root from Agent executable")?;
    let runtime_root = packaged_runtime_root(installation_root);
    if !runtime_root.join("frankenphp.exe").is_file()
        || !runtime_root
            .join("mariadb-11.4.9-winx64/bin/mariadbd.exe")
            .is_file()
    {
        return Err(
            "verified Server Desktop runtime resources are missing beside the Agent".into(),
        );
    }
    let config_path = default_config_path()?;
    let data_root = config_path
        .parent()
        .ok_or("resolve Server Desktop data root")?
        .to_path_buf();
    Ok(RuntimeConfig {
        runtime_root,
        data_root,
        app_key: random_secret("base64:"),
        database_password: random_secret(""),
        database_root_password: random_secret(""),
        database_root_password_legacy_blank: false,
        database_name: "accore".into(),
        server_id: format!("accore-server-{}", random_secret("")),
        server_name: default_server_name(),
        public_api_base: String::new(),
        certificate_fingerprint: String::new(),
        direct_tls_enabled: false,
        allowed_remote_addresses: Vec::new(),
        tls_certificate_path: String::new(),
        tls_private_key_path: String::new(),
        direct_tls_port: default_direct_tls_port(),
    })
}

#[cfg(windows)]
fn harden_runtime_data_access(config: &RuntimeConfig) -> Result<(), String> {
    apply_windows_acl(&config.data_root, false)?;
    apply_windows_acl(&public_status_root(config), true)
}

#[cfg(windows)]
fn remote_firewall_rule_name() -> &'static str {
    "ACCORE ERP Server TLS API"
}

#[cfg(windows)]
fn remove_remote_firewall_rule(_config: &RuntimeConfig) -> Result<(), String> {
    let status = Command::new("netsh.exe")
        .args([
            "advfirewall",
            "firewall",
            "delete",
            "rule",
            &format!("name={}", remote_firewall_rule_name()),
        ])
        .status()
        .map_err(|error| format!("remove ACCORE TLS firewall rule: {error}"))?;
    if status.success() || status.code() == Some(1) {
        Ok(())
    } else {
        Err(format!("remove ACCORE TLS firewall rule exited with {status}"))
    }
}

#[cfg(windows)]
fn sync_remote_firewall_rule(config: &RuntimeConfig) -> Result<(), String> {
    remove_remote_firewall_rule(config)?;
    if !config.direct_tls_enabled {
        return Ok(());
    }
    if config.allowed_remote_addresses.is_empty() {
        return Err("direct TLS cannot create a firewall rule without allowed remote addresses".into());
    }

    let remote_addresses = config.allowed_remote_addresses.join(",");
    run_checked(
        Command::new("netsh.exe").args([
            "advfirewall",
            "firewall",
            "add",
            "rule",
            &format!("name={}", remote_firewall_rule_name()),
            "dir=in",
            "action=allow",
            "protocol=TCP",
            &format!("localport={}", config.direct_tls_port),
            &format!("remoteip={remote_addresses}"),
            "profile=any",
        ]),
        "create ACCORE TLS firewall rule",
    )
}

#[cfg(windows)]
fn apply_windows_acl(path: &Path, permit_users_read: bool) -> Result<(), String> {
    let mut command = Command::new("icacls.exe");
    command.arg(path).args([
        "/inheritance:r",
        "/grant:r",
        "SYSTEM:(OI)(CI)F",
        "/grant:r",
        "Administrators:(OI)(CI)F",
    ]);
    if permit_users_read {
        command.args(["/grant:r", "Users:(OI)(CI)RX"]);
    }
    command.args(["/t", "/c", "/q"]);
    run_checked(
        &mut command,
        "harden Server Desktop runtime data permissions",
    )
}

#[cfg(windows)]
fn random_secret(prefix: &str) -> String {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    format!("{prefix}{}", URL_SAFE_NO_PAD.encode(bytes))
}

fn public_status_root(config: &RuntimeConfig) -> PathBuf {
    config
        .data_root
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_else(|| config.data_root.clone())
        .join("Server Status")
}

fn packaged_runtime_root(installation_root: &Path) -> PathBuf {
    installation_root.join("resources/server-runtime/windows-x86_64")
}

#[cfg(windows)]
fn write_config(path: &Path, config: &RuntimeConfig) -> Result<(), String> {
    let temporary = path.with_extension("json.partial");
    let payload = serde_json::to_vec_pretty(config)
        .map_err(|error| format!("serialize Agent configuration: {error}"))?;
    fs::write(&temporary, payload)
        .map_err(|error| format!("write Agent configuration: {error}"))?;
    fs::rename(&temporary, path).map_err(|error| format!("publish Agent configuration: {error}"))
}

fn load_config(path: &Path) -> Result<RuntimeConfig, String> {
    serde_json::from_slice(
        &fs::read(path).map_err(|error| format!("read runtime config: {error}"))?,
    )
    .map_err(|error| format!("parse runtime config: {error}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn config() -> RuntimeConfig {
        RuntimeConfig {
            runtime_root: PathBuf::from("C:/Program Files/ACCORE ERP Server Desktop/runtime"),
            data_root: PathBuf::from("C:/ProgramData/ACCORE ERP/Server"),
            app_key: "base64:test".into(),
            database_password: "application-password".into(),
            database_root_password: "root-password".into(),
            database_root_password_legacy_blank: false,
            database_name: "accore".into(),
            server_id: "accore-server-test".into(),
            server_name: default_server_name(),
            public_api_base: String::new(),
            certificate_fingerprint: String::new(),
            direct_tls_enabled: false,
            allowed_remote_addresses: Vec::new(),
            tls_certificate_path: String::new(),
            tls_private_key_path: String::new(),
            direct_tls_port: default_direct_tls_port(),
        }
    }

    #[test]
    fn status_is_published_outside_the_private_secret_root() {
        let config = config();
        let status = status_path(&config);
        assert_ne!(status.parent(), Some(config.data_root.as_path()));
        assert!(status.ends_with("Server Status/runtime-status.json"));
    }

    #[test]
    fn legacy_configuration_without_root_password_remains_readable_for_hardening() {
        let legacy = r#"{
          "runtimeRoot":"C:/runtime",
          "dataRoot":"C:/data",
          "appKey":"base64:test",
          "databasePassword":"application-password",
          "databaseName":"accore"
        }"#;
        let parsed: RuntimeConfig = serde_json::from_str(legacy).expect("legacy config parses");
        assert!(parsed.database_root_password.is_empty());
        assert!(!parsed.database_root_password_legacy_blank);
    }

    #[test]
    fn packaged_runtime_root_matches_the_msi_resource_layout() {
        let installation_root = PathBuf::from("C:/Program Files/ACCORE ERP Server Desktop");
        assert_eq!(
            packaged_runtime_root(&installation_root),
            installation_root.join("resources/server-runtime/windows-x86_64")
        );
    }

    #[test]
    fn caddy_configuration_quotes_windows_application_paths_with_spaces() {
        let configuration =
            generated_caddy_configuration(&config()).expect("generate Caddy configuration");
        assert!(configuration.contains(
            "root * \"C:/Program Files/ACCORE ERP Server Desktop/runtime/app/public\""
        ));
        assert!(!configuration.contains(
            "root * C:/Program Files/ACCORE ERP Server Desktop/runtime/app/public"
        ));
    }

    #[test]
    fn guarded_seed_recovery_accepts_a_numeric_user_count() {
        assert_eq!(parse_database_count("0\n").expect("zero users parses"), 0);
        assert_eq!(parse_database_count("12\n").expect("existing users parse"), 12);
    }

    #[test]
    fn guarded_seed_recovery_rejects_a_non_numeric_user_count() {
        assert!(parse_database_count("not-a-count\n").is_err());
    }

    #[test]
    fn non_interactive_response_requires_complete_remote_trust_material() {
        assert!(validate_install_response(&InstallResponse {
            server_name: Some("Remote ACCORE".into()),
            public_api_base: Some("https://erp.example.test/api".into()),
            certificate_fingerprint: Some("a".repeat(64)),
            tls_certificate_path: Some("C:/secure/server.crt".into()),
            tls_private_key_path: Some("C:/secure/server.key".into()),
            allowed_remote_addresses: Some(vec!["203.0.113.0/24".into()]),
            direct_tls_port: Some(9443),
        })
        .is_ok());
        assert!(validate_install_response(&InstallResponse {
            server_name: None,
            public_api_base: Some("http://erp.example.test/api".into()),
            certificate_fingerprint: Some("a".repeat(64)),
            ..Default::default()
        })
        .is_err());
        assert!(validate_install_response(&InstallResponse {
            server_name: None,
            public_api_base: Some("https://erp.example.test/api".into()),
            certificate_fingerprint: None,
            ..Default::default()
        })
        .is_err());
    }
}
