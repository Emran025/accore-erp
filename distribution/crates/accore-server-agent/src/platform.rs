use crate::LocalControlEndpoint;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PlatformKind {
    Windows,
    MacOs,
    Linux,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ServiceRegistration {
    pub service_name: String,
    pub starts_at_boot: bool,
    pub executable: String,
    pub arguments: Vec<String>,
    pub control_endpoint: LocalControlEndpoint,
}

/// OS-specific registration metadata. An installer invokes the operating system's
/// native registration API with this data; it never falls back to a user-level
/// background process, so the Agent outlives the Server Desktop application.
pub trait ServiceRegistrationAdapter {
    fn platform(&self) -> PlatformKind;
    fn registration(&self, executable: &str) -> ServiceRegistration;
}

#[derive(Debug, Default)]
pub struct WindowsScmAdapter;
impl ServiceRegistrationAdapter for WindowsScmAdapter {
    fn platform(&self) -> PlatformKind { PlatformKind::Windows }
    fn registration(&self, executable: &str) -> ServiceRegistration {
        ServiceRegistration {
            service_name: "AccoreServerAgent".into(),
            starts_at_boot: true,
            executable: executable.into(),
            arguments: vec!["--service".into(), "--scm".into()],
            control_endpoint: LocalControlEndpoint::WindowsNamedPipe {
                name: r"\\.\pipe\AccoreServerAgent".into(),
                administrators_only: true,
            },
        }
    }
}

#[derive(Debug, Default)]
pub struct LaunchdAdapter;
impl ServiceRegistrationAdapter for LaunchdAdapter {
    fn platform(&self) -> PlatformKind { PlatformKind::MacOs }
    fn registration(&self, executable: &str) -> ServiceRegistration {
        ServiceRegistration {
            service_name: "im.accore.server-agent".into(),
            starts_at_boot: true,
            executable: executable.into(),
            arguments: vec!["--service".into(), "--launchd".into()],
            control_endpoint: LocalControlEndpoint::UnixSocket {
                path: "/var/run/accore/server-agent.sock".into(),
                mode: 0o600,
            },
        }
    }
}

#[derive(Debug, Default)]
pub struct SystemdAdapter;
impl ServiceRegistrationAdapter for SystemdAdapter {
    fn platform(&self) -> PlatformKind { PlatformKind::Linux }
    fn registration(&self, executable: &str) -> ServiceRegistration {
        ServiceRegistration {
            service_name: "accore-server-agent.service".into(),
            starts_at_boot: true,
            executable: executable.into(),
            arguments: vec!["--service".into(), "--systemd".into()],
            control_endpoint: LocalControlEndpoint::UnixSocket {
                path: "/var/run/accore/server-agent.sock".into(),
                mode: 0o600,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{LaunchdAdapter, ServiceRegistrationAdapter, SystemdAdapter, WindowsScmAdapter};
    use crate::LocalControlEndpoint;

    #[test]
    fn every_platform_registers_a_boot_service_and_local_only_control_channel() {
        for registration in [
            WindowsScmAdapter.registration("agent"),
            LaunchdAdapter.registration("agent"),
            SystemdAdapter.registration("agent"),
        ] {
            assert!(registration.starts_at_boot);
            match registration.control_endpoint {
                LocalControlEndpoint::WindowsNamedPipe { administrators_only, .. } => assert!(administrators_only),
                LocalControlEndpoint::UnixSocket { mode, .. } => assert_eq!(mode, 0o600),
            }
        }
    }
}
