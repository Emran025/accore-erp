#[cfg(windows)]
use std::{ffi::OsString, path::Path, sync::mpsc, time::Duration};

#[cfg(windows)]
use windows_service::{
    define_windows_service,
    service::{
        ServiceAccess, ServiceControl, ServiceControlAccept, ServiceErrorControl, ServiceExitCode,
        ServiceInfo, ServiceStartType, ServiceState, ServiceStatus, ServiceType,
    },
    service_control_handler::{self, ServiceControlHandlerResult},
    service_dispatcher,
    service_manager::{ServiceManager, ServiceManagerAccess},
};

#[cfg(windows)]
const SERVICE_NAME: &str = "ACCOREServerAgent";
#[cfg(windows)]
const SERVICE_DISPLAY_NAME: &str = "ACCORE ERP Server Agent";

#[cfg(windows)]
pub fn install_service(config_path: String) -> Result<(), String> {
    let executable =
        std::env::current_exe().map_err(|error| format!("resolve Agent executable: {error}"))?;
    let manager =
        ServiceManager::local_computer(None::<&str>, ServiceManagerAccess::CREATE_SERVICE)
            .map_err(|error| format!("open Windows Service Control Manager: {error}"))?;
    let info = ServiceInfo {
        name: OsString::from(SERVICE_NAME),
        display_name: OsString::from(SERVICE_DISPLAY_NAME),
        service_type: ServiceType::OWN_PROCESS,
        start_type: ServiceStartType::AutoStart,
        error_control: ServiceErrorControl::Normal,
        executable_path: executable,
        launch_arguments: vec![
            OsString::from("service"),
            OsString::from("--config"),
            OsString::from(config_path),
        ],
        dependencies: vec![],
        account_name: None,
        account_password: None,
    };
    let service = manager
        .create_service(
            &info,
            ServiceAccess::QUERY_STATUS
                | ServiceAccess::START
                | ServiceAccess::STOP
                | ServiceAccess::DELETE,
        )
        .or_else(|_| {
            manager.open_service(
                SERVICE_NAME,
                ServiceAccess::QUERY_STATUS
                    | ServiceAccess::START
                    | ServiceAccess::STOP
                    | ServiceAccess::DELETE,
            )
        })
        .map_err(|error| format!("install ACCORE Server Agent service: {error}"))?;
    let _ = service.start::<&str>(&[]);
    Ok(())
}

#[cfg(windows)]
pub fn uninstall_service() -> Result<(), String> {
    let manager = ServiceManager::local_computer(None::<&str>, ServiceManagerAccess::CONNECT)
        .map_err(|error| format!("open Windows Service Control Manager: {error}"))?;
    let service = manager
        .open_service(
            SERVICE_NAME,
            ServiceAccess::STOP | ServiceAccess::DELETE | ServiceAccess::QUERY_STATUS,
        )
        .map_err(|error| format!("open ACCORE Server Agent service: {error}"))?;
    let _ = service.stop();
    let stopped = (0..60).any(|_| {
        if matches!(
            service.query_status().map(|status| status.current_state),
            Ok(ServiceState::Stopped)
        ) {
            true
        } else {
            std::thread::sleep(Duration::from_millis(500));
            false
        }
    });
    if !stopped {
        return Err("ACCORE Server Agent did not stop within 30 seconds before removal".into());
    }
    service
        .delete()
        .map_err(|error| format!("remove ACCORE Server Agent service: {error}"))
}

#[cfg(windows)]
pub fn stop_service() -> Result<(), String> {
    let manager = ServiceManager::local_computer(None::<&str>, ServiceManagerAccess::CONNECT)
        .map_err(|error| format!("open Windows Service Control Manager: {error}"))?;
    let service = manager
        .open_service(SERVICE_NAME, ServiceAccess::STOP)
        .map_err(|error| format!("open ACCORE Server Agent service: {error}"))?;
    service
        .stop()
        .map(|_| ())
        .map_err(|error| format!("stop ACCORE Server Agent service: {error}"))
}

#[cfg(windows)]
pub fn run_service(config_path: String) -> Result<(), String> {
    std::env::set_var("ACCORE_SERVER_AGENT_CONFIG", config_path);
    service_dispatcher::start(SERVICE_NAME, ffi_service_main)
        .map_err(|error| format!("start Windows service dispatcher: {error}"))
}

#[cfg(windows)]
define_windows_service!(ffi_service_main, service_main);

#[cfg(windows)]
fn service_main(_arguments: Vec<OsString>) {
    let (stop_sender, stop_receiver) = mpsc::channel();
    let status_handle =
        match service_control_handler::register(SERVICE_NAME, move |control| match control {
            ServiceControl::Stop => {
                let _ = stop_sender.send(());
                ServiceControlHandlerResult::NoError
            }
            _ => ServiceControlHandlerResult::NotImplemented,
        }) {
            Ok(handle) => handle,
            Err(_) => return,
        };

    let _ = status_handle.set_service_status(ServiceStatus {
        service_type: ServiceType::OWN_PROCESS,
        current_state: ServiceState::Running,
        controls_accepted: ServiceControlAccept::STOP,
        exit_code: ServiceExitCode::Win32(0),
        checkpoint: 0,
        wait_hint: Duration::default(),
        process_id: None,
    });

    let config = std::env::var("ACCORE_SERVER_AGENT_CONFIG").ok();
    let mut worker = config.as_ref().map(|config| {
        let worker_config = config.clone();
        std::thread::spawn(move || super::execute_service_with_config(Path::new(&worker_config)))
    });

    loop {
        match stop_receiver.recv_timeout(Duration::from_millis(500)) {
            Ok(()) => {
                if let Some(config) = config.as_ref() {
                    let _ = super::request_stop_for_config(Path::new(config));
                }
                let _ = status_handle.set_service_status(ServiceStatus {
                    service_type: ServiceType::OWN_PROCESS,
                    current_state: ServiceState::StopPending,
                    controls_accepted: ServiceControlAccept::empty(),
                    exit_code: ServiceExitCode::Win32(0),
                    checkpoint: 0,
                    wait_hint: Duration::from_secs(10),
                    process_id: None,
                });
                break;
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {
                if worker
                    .as_ref()
                    .map_or(true, std::thread::JoinHandle::is_finished)
                {
                    break;
                }
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => break,
        }
    }

    if let Some(worker) = worker.take() {
        let _ = worker.join();
    }

    let _ = status_handle.set_service_status(ServiceStatus {
        service_type: ServiceType::OWN_PROCESS,
        current_state: ServiceState::Stopped,
        controls_accepted: ServiceControlAccept::empty(),
        exit_code: ServiceExitCode::Win32(0),
        checkpoint: 0,
        wait_hint: Duration::default(),
        process_id: None,
    });
}

#[cfg(not(windows))]
#[allow(dead_code)]
pub fn install_service(_config_path: String) -> Result<(), String> {
    Err("Windows Service installation is supported only on Windows".into())
}
#[cfg(not(windows))]
pub fn uninstall_service() -> Result<(), String> {
    Err("Windows Service removal is supported only on Windows".into())
}
#[cfg(not(windows))]
pub fn run_service(_config_path: String) -> Result<(), String> {
    Err("Windows Service dispatch is supported only on Windows".into())
}
#[cfg(not(windows))]
pub fn stop_service() -> Result<(), String> {
    Err("Windows Service control is supported only on Windows".into())
}
