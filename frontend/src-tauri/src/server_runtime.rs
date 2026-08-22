use std::{env, fs, path::PathBuf, thread, time::Duration};

use serde::{Deserialize, Serialize};
#[cfg(windows)]
use std::{
    ffi::OsStr,
    os::windows::ffi::OsStrExt,
    path::Path,
    ptr,
};
use tauri::{AppHandle, Manager};
#[cfg(windows)]
use windows_sys::Win32::{
    UI::{
        Shell::ShellExecuteW,
        WindowsAndMessaging::SW_HIDE,
    },
};

const AGENT_BINARY: &str = "accore-server-agent.exe";
const RUNTIME_RELATIVE_PATH: &str = "server-runtime/windows-x86_64";
const SERVER_DESKTOP_CLAIM_ARGUMENTS: &str = "claim --owner server-desktop";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerRuntimeSnapshot {
    pub state: String,
    pub detail: String,
    pub database: RuntimeComponentSnapshot,
    pub api: RuntimeComponentSnapshot,
    pub queue: RuntimeComponentSnapshot,
    pub backup: RuntimeComponentSnapshot,
    #[serde(default)]
    pub runtime_present: bool,
    pub updated_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeComponentSnapshot {
    pub state: String,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerBackupSnapshot {
    pub state: String,
    pub detail: String,
    pub retained_restore_points: usize,
    pub last_backup_at_unix: Option<u64>,
    pub last_verified_at_unix: Option<u64>,
    pub updated_at_unix: Option<u64>,
}

#[tauri::command]
pub fn server_runtime_status(app: AppHandle) -> Result<ServerRuntimeSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    let missing_resources = paths.missing_resources();
    if !missing_resources.is_empty() {
        return Ok(unavailable(
            format!(
                "required self-contained runtime resource(s) are missing: {}",
                missing_resources.join(", ")
            ),
            false,
        ));
    }

    let status_path = paths.status_root.join("runtime-status.json");
    if !status_path.is_file() {
        return Ok(unavailable("local server is not initialized", true));
    }

    let raw =
        fs::read(&status_path).map_err(|error| format!("read server runtime status: {error}"))?;
    parse_published_runtime_snapshot(&raw)
}

fn parse_published_runtime_snapshot(raw: &[u8]) -> Result<ServerRuntimeSnapshot, String> {
    let mut status: ServerRuntimeSnapshot = serde_json::from_slice(raw)
        .map_err(|error| format!("parse server runtime status: {error}"))?;
    status.runtime_present = true;
    Ok(status)
}

#[tauri::command]
pub fn server_runtime_start(app: AppHandle) -> Result<ServerRuntimeSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    let missing_resources = paths.missing_resources();
    if !missing_resources.is_empty() {
        return Ok(unavailable(
            format!(
                "runtime package verification failed; missing: {}",
                missing_resources.join(", ")
            ),
            false,
        ));
    }

    let current = server_runtime_status(app.clone())?;
    if matches!(current.state.as_str(), "ready" | "bootstrapping") {
        return Ok(current);
    }

    start_windows_service_agent(&paths.agent_binary)?;

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

fn start_windows_service_agent(agent_binary: &std::path::Path) -> Result<(), String> {
    #[cfg(windows)]
    {
        return launch_elevated_agent(
            agent_binary,
            SERVER_DESKTOP_CLAIM_ARGUMENTS,
            "claim or update the Server Desktop Agent",
        );
    }

    #[cfg(not(windows))]
    {
        let _ = agent_binary;
        Err(
            "self-contained Server Desktop service installation is supported only on Windows x64"
                .into(),
        )
    }
}

#[tauri::command]
pub fn server_runtime_stop(app: AppHandle) -> Result<ServerRuntimeSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    if !paths.status_root.join("runtime-status.json").is_file() {
        return Ok(unavailable(
            "local server is not initialized",
            paths.runtime_root.exists(),
        ));
    }
    stop_windows_service_agent(&paths.agent_binary)?;
    Ok(server_runtime_status(app)?)
}

#[tauri::command]
pub fn server_backup_status(app: AppHandle) -> Result<ServerBackupSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    server_backup_status_from_paths(&paths)
}

#[tauri::command]
pub fn trigger_server_backup(app: AppHandle) -> Result<ServerBackupSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    let status = server_runtime_status(app)?;
    if status.state != "ready" {
        return Err(
            "a protected backup can be requested only when the local server is ready".into(),
        );
    }
    request_windows_service_backup(&paths.agent_binary, &paths.config_path)?;
    server_backup_status_from_paths(&paths)
}

#[tauri::command]
pub fn prepare_server_desktop_update(app: AppHandle) -> Result<ServerRuntimeSnapshot, String> {
    let paths = RuntimePaths::resolve(&app)?;
    let current = server_runtime_status(app.clone())?;
    if current.state != "ready" {
        return Err(
            "signed update installation is blocked until the local server reports ready".into(),
        );
    }
    stop_windows_service_agent(&paths.agent_binary)?;
    for _ in 0..180 {
        thread::sleep(Duration::from_millis(500));
        let status = server_runtime_status(app.clone())?;
        if status.state == "stopped" {
            return Ok(status);
        }
    }
    Err("local server did not confirm ordered shutdown before update installation".into())
}

struct RuntimePaths {
    runtime_root: PathBuf,
    config_path: PathBuf,
    status_root: PathBuf,
    agent_binary: PathBuf,
}

impl RuntimePaths {
    fn resolve(app: &AppHandle) -> Result<Self, String> {
        let tauri_resource_root = app
            .path()
            .resource_dir()
            .map_err(|error| format!("resolve packaged resource directory: {error}"))?;
        let executable_root = env::current_exe()
            .map_err(|error| format!("resolve Server Desktop executable: {error}"))?
            .parent()
            .map(PathBuf::from)
            .ok_or("resolve Server Desktop installation root from executable")?;
        let executable_resource_root = executable_root.join("resources");
        let executable_runtime_root = executable_resource_root.join(RUNTIME_RELATIVE_PATH);
        let tauri_runtime_root = tauri_resource_root.join(RUNTIME_RELATIVE_PATH);
        let runtime_root = if required_runtime_files_exist(&executable_runtime_root) {
            executable_runtime_root
        } else {
            tauri_runtime_root
        };
        let executable_agent = executable_root.join(AGENT_BINARY);
        let agent_binary = if executable_agent.is_file() {
            executable_agent
        } else {
            tauri_resource_root
                .parent()
                .ok_or("resolve Server Desktop installation root from resource directory")?
                .join(AGENT_BINARY)
        };
        let data_root = env::var_os("PROGRAMDATA")
            .map(PathBuf::from)
            .unwrap_or(
                app.path()
                    .app_local_data_dir()
                    .map_err(|error| format!("resolve application data directory: {error}"))?,
            )
            .join("ACCORE ERP")
            .join("Server");
        let status_root = data_root
            .parent()
            .map(PathBuf::from)
            .unwrap_or_else(|| data_root.clone())
            .join("Server Status");
        Ok(Self {
            runtime_root,
            config_path: data_root.join("agent-config.json"),
            agent_binary,
            status_root,
        })
    }

    fn missing_resources(&self) -> Vec<&'static str> {
        let mut missing = Vec::new();
        if !self.runtime_root.join("frankenphp.exe").is_file() {
            missing.push("embedded FrankenPHP runtime");
        }
        if !self
            .runtime_root
            .join("mariadb-11.4.9-winx64/bin/mariadbd.exe")
            .is_file()
        {
            missing.push("embedded MariaDB runtime");
        }
        if !self.agent_binary.is_file() {
            missing.push("ACCORE Server Agent");
        }
        missing
    }
}

fn required_runtime_files_exist(runtime_root: &std::path::Path) -> bool {
    runtime_root.join("frankenphp.exe").is_file()
        && runtime_root
            .join("mariadb-11.4.9-winx64/bin/mariadbd.exe")
            .is_file()
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
        backup: RuntimeComponentSnapshot {
            state: "unavailable".into(),
            detail: "not initialized".into(),
        },
        runtime_present,
        updated_at: None,
    }
}
fn server_backup_status_from_paths(paths: &RuntimePaths) -> Result<ServerBackupSnapshot, String> {
    let path = paths.status_root.join("backup-status.json");
    if !path.is_file() {
        return Ok(ServerBackupSnapshot {
            state: "unavailable".into(),
            detail: "backup policy has not published a status yet".into(),
            retained_restore_points: 0,
            last_backup_at_unix: None,
            last_verified_at_unix: None,
            updated_at_unix: None,
        });
    }
    serde_json::from_slice(
        &fs::read(path).map_err(|error| format!("read server backup status: {error}"))?,
    )
    .map_err(|error| format!("parse server backup status: {error}"))
}

fn request_windows_service_backup(
    agent_binary: &std::path::Path,
    config_path: &std::path::Path,
) -> Result<(), String> {
    #[cfg(windows)]
    {
        let arguments = agent_arguments("request-backup", Some(config_path));
        return launch_elevated_agent(agent_binary, &arguments, "request a protected backup");
    }

    #[cfg(not(windows))]
    {
        let _ = (agent_binary, config_path);
        Err("self-contained Server Desktop backup is supported only on Windows x64".into())
    }
}

fn stop_windows_service_agent(agent_binary: &std::path::Path) -> Result<(), String> {
    #[cfg(windows)]
    {
        launch_elevated_agent(agent_binary, "stop", "stop the Server Agent")
    }

    #[cfg(not(windows))]
    {
        let _ = agent_binary;
        Err("self-contained Server Desktop service control is supported only on Windows x64".into())
    }
}

fn agent_arguments(command: &str, config_path: Option<&std::path::Path>) -> String {
    let Some(config_path) = config_path else {
        return command.into();
    };
    format!(
        "{command} --config \"{}\"",
        config_path.display().to_string().replace('"', "\\\"")
    )
}

#[cfg(windows)]
fn launch_elevated_agent(
    agent_binary: &Path,
    arguments: &str,
    operation: &str,
) -> Result<(), String> {
    fn wide(value: &OsStr) -> Vec<u16> {
        value.encode_wide().chain(std::iter::once(0)).collect()
    }

    let verb = wide(OsStr::new("runas"));
    let executable = wide(agent_binary.as_os_str());
    let arguments = wide(OsStr::new(arguments));
    let result = unsafe {
        ShellExecuteW(
            ptr::null_mut(),
            verb.as_ptr(),
            executable.as_ptr(),
            arguments.as_ptr(),
            ptr::null(),
            SW_HIDE,
        )
    };
    // ShellExecuteW returns an HINSTANCE (a raw pointer in windows-sys). Its
    // documented error contract uses the numeric range 0..=32, so convert the
    // opaque handle to its integer representation before inspecting it.
    let result_code = result as usize;
    if result_code <= 32 {
        return Err(format!(
            "could not {operation} without a visible console; approve the Windows elevation prompt and retry (ShellExecute result {result_code})"
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_a_ready_agent_snapshot_without_bridge_only_runtime_presence() {
        let status = parse_published_runtime_snapshot(
            br#"{
              "state":"ready",
              "detail":"all local server components are ready",
              "database":{"state":"ready","detail":"MariaDB is ready"},
              "api":{"state":"ready","detail":"API is ready"},
              "queue":{"state":"ready","detail":"queue worker is running"},
              "backup":{"state":"ready","detail":"restore point is verified"},
              "updatedAt":1787315152
            }"#,
        )
        .expect("published Agent snapshots omit runtimePresent but must remain readable");

        assert_eq!(status.state, "ready");
        assert!(status.runtime_present);
        assert_eq!(status.updated_at, Some(1787315152));
    }

    #[test]
    fn backup_agent_arguments_quote_the_private_configuration_path() {
        let arguments = agent_arguments(
            "request-backup",
            Some(std::path::Path::new(
                "C:/ProgramData/ACCORE ERP/Server/agent-config.json",
            )),
        );
        assert_eq!(
            arguments,
            "request-backup --config \"C:/ProgramData/ACCORE ERP/Server/agent-config.json\""
        );
    }

    #[test]
    fn server_desktop_claims_the_agent_with_an_explicit_owner() {
        assert_eq!(SERVER_DESKTOP_CLAIM_ARGUMENTS, "claim --owner server-desktop");
    }
}
