use std::{env, fs, path::PathBuf, process::Command, thread, time::Duration};

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

const AGENT_BINARY: &str = "accore-server-agent-x86_64-pc-windows-msvc.exe";
const RUNTIME_RELATIVE_PATH: &str = "resources/server-runtime/windows-x86_64";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerRuntimeSnapshot {
    pub state: String,
    pub detail: String,
    pub database: RuntimeComponentSnapshot,
    pub api: RuntimeComponentSnapshot,
    pub queue: RuntimeComponentSnapshot,
    pub runtime_present: bool,
    pub updated_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeComponentSnapshot {
    pub state: String,
    pub detail: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AgentConfiguration {
    runtime_root: PathBuf,
    data_root: PathBuf,
    app_key: String,
    database_password: String,
    database_name: String,
}

#[tauri::command]
pub fn server_runtime_status(app: AppHandle) -> Result<ServerRuntimeSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    if !paths.runtime_root.join("frankenphp.exe").is_file()
        || !paths
            .runtime_root
            .join("mariadb-11.4.9-winx64/bin/mariadbd.exe")
            .is_file()
        || !paths.agent_binary.is_file()
    {
        return Ok(unavailable(
            "required self-contained runtime resources are not installed",
            false,
        ));
    }

    let status_path = paths.data_root.join("runtime-status.json");
    if !status_path.is_file() {
        return Ok(unavailable("local server is not initialized", true));
    }

    let raw =
        fs::read(&status_path).map_err(|error| format!("read server runtime status: {error}"))?;
    let mut status: ServerRuntimeSnapshot = serde_json::from_slice(&raw)
        .map_err(|error| format!("parse server runtime status: {error}"))?;
    status.runtime_present = true;
    Ok(status)
}

#[tauri::command]
pub fn server_runtime_start(app: AppHandle) -> Result<ServerRuntimeSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    if !paths.agent_binary.is_file() {
        return Ok(unavailable("ACCORE Server Agent is not installed", false));
    }
    if !paths.runtime_root.join("frankenphp.exe").is_file()
        || !paths
            .runtime_root
            .join("mariadb-11.4.9-winx64/bin/mariadbd.exe")
            .is_file()
    {
        return Ok(unavailable(
            "runtime package verification has not completed",
            false,
        ));
    }

    fs::create_dir_all(&paths.data_root)
        .map_err(|error| format!("create durable runtime data directory: {error}"))?;
    let config_path = paths.data_root.join("agent-config.json");
    if !config_path.is_file() {
        let configuration = AgentConfiguration {
            runtime_root: paths.runtime_root.clone(),
            data_root: paths.data_root.clone(),
            app_key: random_secret("base64:"),
            database_password: random_secret(""),
            database_name: "accore".into(),
        };
        fs::write(
            &config_path,
            serde_json::to_vec_pretty(&configuration)
                .map_err(|error| format!("serialize agent configuration: {error}"))?,
        )
        .map_err(|error| format!("write agent configuration: {error}"))?;
    }

    let current = server_runtime_status(app.clone())?;
    if matches!(current.state.as_str(), "ready" | "bootstrapping") {
        return Ok(current);
    }

    start_windows_service_agent(&paths.agent_binary, &config_path)?;

    for _ in 0..10 {
        thread::sleep(Duration::from_millis(250));
        let status = server_runtime_status(app.clone())?;
        if status.state != "unavailable" {
            return Ok(status);
        }
    }
    Ok(unavailable(
        "Server Agent started but has not yet published readiness",
        true,
    ))
}

fn start_windows_service_agent(
    agent_binary: &std::path::Path,
    config_path: &std::path::Path,
) -> Result<(), String> {
    #[cfg(windows)]
    {
        let executable = agent_binary.display().to_string().replace('"', "\"\"");
        let configuration = config_path.display().to_string().replace('"', "\"\"");
        let install_command = format!(
            "Start-Process -FilePath \"{executable}\" -ArgumentList 'install','--config','{configuration}' -Verb RunAs -Wait"
        );
        let result = Command::new("powershell.exe")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                &install_command,
            ])
            .status()
            .map_err(|error| format!("request elevated Server Agent installation: {error}"))?;
        if !result.success() {
            return Err(format!(
                "elevated Server Agent installation exited with {result}"
            ));
        }
        return Ok(());
    }

    #[cfg(not(windows))]
    {
        let _ = (agent_binary, config_path);
        Err(
            "self-contained Server Desktop service installation is supported only on Windows x64"
                .into(),
        )
    }
}

#[tauri::command]
pub fn server_runtime_stop(app: AppHandle) -> Result<ServerRuntimeSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    let config_path = paths.data_root.join("agent-config.json");
    if !config_path.is_file() {
        return Ok(unavailable(
            "local server is not initialized",
            paths.runtime_root.exists(),
        ));
    }
    Command::new(&paths.agent_binary)
        .args(["stop", "--config"])
        .arg(config_path)
        .output()
        .map_err(|error| format!("request ordered server shutdown: {error}"))?;
    Ok(server_runtime_status(app)?)
}

struct RuntimePaths {
    runtime_root: PathBuf,
    data_root: PathBuf,
    agent_binary: PathBuf,
}

impl RuntimePaths {
    fn resolve(app: &AppHandle) -> Result<Self, String> {
        let resource_root = app
            .path()
            .resource_dir()
            .map_err(|error| format!("resolve packaged resource directory: {error}"))?;
        let data_root = env::var_os("PROGRAMDATA")
            .map(PathBuf::from)
            .unwrap_or(
                app.path()
                    .app_local_data_dir()
                    .map_err(|error| format!("resolve application data directory: {error}"))?,
            )
            .join("ACCORE ERP")
            .join("Server");
        Ok(Self {
            runtime_root: resource_root.join(RUNTIME_RELATIVE_PATH),
            agent_binary: resource_root.join("binaries").join(AGENT_BINARY),
            data_root,
        })
    }
}

fn unavailable(detail: impl Into<String>, runtime_present: bool) -> ServerRuntimeSnapshot {
    ServerRuntimeSnapshot {
        state: "unavailable".into(),
        detail: detail.into(),
        database: RuntimeComponentSnapshot {
            state: "unavailable".into(),
            detail: "not running".into(),
        },
        api: RuntimeComponentSnapshot {
            state: "unavailable".into(),
            detail: "not running".into(),
        },
        queue: RuntimeComponentSnapshot {
            state: "unavailable".into(),
            detail: "not running".into(),
        },
        runtime_present,
        updated_at: None,
    }
}

fn random_secret(prefix: &str) -> String {
    let mut bytes = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut bytes);
    format!("{prefix}{}", URL_SAFE_NO_PAD.encode(bytes))
}
