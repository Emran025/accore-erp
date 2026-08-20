//! Accore Server Agent service-supervisor primitives.
//!
//! The agent owns local runtime lifecycle while the desktop product remains only a
//! privileged management surface. It never exposes a network control port: a
//! platform adapter must bind the control protocol to an ACL-protected named pipe
//! on Windows or a mode-0600 Unix socket on macOS/Linux.

use std::fmt;

mod operations;
mod platform;
pub use operations::{
    BackupOperator, BackupRecord, BackupRetentionPolicy, BackupSchedule, BackupSupervisor,
    ComponentHealth, ComponentHealthState, HealthComponent, OperationalAuditEvent,
    OperationalEventKind, OperationalHealthReport,
};
pub use platform::{
    LaunchdAdapter, PlatformKind, ServiceRegistration, ServiceRegistrationAdapter, SystemdAdapter,
    WindowsScmAdapter,
};

const MAX_API_RESTARTS: u8 = 3;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum ManagedService {
    Database,
    Api,
    Queue,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ServiceState {
    Stopped,
    Starting,
    Ready,
    Draining,
    Unhealthy,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AgentHealth {
    Healthy,
    Degraded,
    Unhealthy,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ServiceStatus {
    pub service: ManagedService,
    pub state: ServiceState,
    pub restart_attempts: u8,
    pub detail: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AgentStatus {
    pub health: AgentHealth,
    pub database: ServiceStatus,
    pub api: ServiceStatus,
    pub queue: ServiceStatus,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LocalIdentity {
    SystemService,
    LocalAdministrator,
    ServerDesktop,
    UnprivilegedUser,
    RemotePeer,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AgentCommand {
    Start,
    Stop,
    Status,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AgentError {
    Unauthorized,
    DependencyUnavailable(ManagedService),
    RestartBudgetExhausted,
    ServiceFailure {
        service: ManagedService,
        detail: String,
    },
}

impl fmt::Display for AgentError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Unauthorized => write!(formatter, "local lifecycle command is not authorized"),
            Self::DependencyUnavailable(service) => {
                write!(formatter, "required dependency is unavailable: {service:?}")
            }
            Self::RestartBudgetExhausted => {
                write!(formatter, "API restart budget has been exhausted")
            }
            Self::ServiceFailure { service, detail } => {
                write!(formatter, "{service:?} failed: {detail}")
            }
        }
    }
}

impl std::error::Error for AgentError {}

/// A platform implementation launches and controls child runtimes but cannot make
/// a policy decision. Platform-specific Windows SCM, launchd, and systemd adapters
/// implement this trait in their respective packaging layers.
pub trait RuntimeController {
    fn start(&mut self, service: ManagedService) -> Result<(), AgentError>;
    fn stop(&mut self, service: ManagedService) -> Result<(), AgentError>;
    fn drain_queue(&mut self) -> Result<(), AgentError>;
    fn is_ready(&mut self, service: ManagedService) -> Result<bool, AgentError>;
}

/// A local-only endpoint descriptor. It contains no TCP host or port, preventing
/// accidental remote lifecycle exposure by construction.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LocalControlEndpoint {
    WindowsNamedPipe {
        name: String,
        administrators_only: bool,
    },
    UnixSocket {
        path: String,
        mode: u16,
    },
}

impl LocalControlEndpoint {
    pub fn platform_default() -> Self {
        #[cfg(windows)]
        {
            return Self::WindowsNamedPipe {
                name: r"\\.\pipe\AccoreServerAgent".into(),
                administrators_only: true,
            };
        }
        #[cfg(not(windows))]
        {
            Self::UnixSocket {
                path: "/var/run/accore/server-agent.sock".into(),
                mode: 0o600,
            }
        }
    }

    pub fn allows(&self, identity: LocalIdentity, command: AgentCommand) -> bool {
        match command {
            AgentCommand::Status => matches!(
                identity,
                LocalIdentity::SystemService
                    | LocalIdentity::LocalAdministrator
                    | LocalIdentity::ServerDesktop
            ),
            AgentCommand::Start | AgentCommand::Stop => matches!(
                identity,
                LocalIdentity::SystemService
                    | LocalIdentity::LocalAdministrator
                    | LocalIdentity::ServerDesktop
            ),
        }
    }
}

/// Deterministic supervisor state machine shared by all platform service adapters.
pub struct ServerAgent<C: RuntimeController> {
    controller: C,
    status: AgentStatus,
}

impl<C: RuntimeController> ServerAgent<C> {
    pub fn new(controller: C) -> Self {
        Self {
            controller,
            status: AgentStatus {
                health: AgentHealth::Degraded,
                database: status(ManagedService::Database),
                api: status(ManagedService::Api),
                queue: status(ManagedService::Queue),
            },
        }
    }

    pub fn status(&self) -> &AgentStatus {
        &self.status
    }

    pub fn execute(
        &mut self,
        endpoint: &LocalControlEndpoint,
        identity: LocalIdentity,
        command: AgentCommand,
    ) -> Result<AgentStatus, AgentError> {
        if !endpoint.allows(identity, command) {
            return Err(AgentError::Unauthorized);
        }
        match command {
            AgentCommand::Start => self.start_all()?,
            AgentCommand::Stop => self.graceful_shutdown()?,
            AgentCommand::Status => self.refresh_health()?,
        }
        Ok(self.status.clone())
    }

    /// Starts database before API and queue. Any unavailable dependency blocks its
    /// dependent process and leaves an actionable unhealthy state.
    pub fn start_all(&mut self) -> Result<(), AgentError> {
        self.start_and_wait(ManagedService::Database)?;
        self.start_and_wait(ManagedService::Api)?;
        self.start_and_wait(ManagedService::Queue)?;
        self.status.health = AgentHealth::Healthy;
        Ok(())
    }

    /// Called when the API process exits unexpectedly. Database is intentionally
    /// retained; only the API receives bounded restart attempts.
    pub fn handle_api_failure(&mut self, detail: impl Into<String>) -> Result<(), AgentError> {
        self.status.api.state = ServiceState::Unhealthy;
        self.status.api.detail = detail.into();
        self.status.health = AgentHealth::Degraded;
        if self.status.database.state != ServiceState::Ready {
            return Err(AgentError::DependencyUnavailable(ManagedService::Database));
        }
        if self.status.api.restart_attempts >= MAX_API_RESTARTS {
            return Err(AgentError::RestartBudgetExhausted);
        }
        self.status.api.restart_attempts += 1;
        self.start_and_wait(ManagedService::Api)?;
        self.status.health = if self.status.queue.state == ServiceState::Ready {
            AgentHealth::Healthy
        } else {
            AgentHealth::Degraded
        };
        Ok(())
    }

    /// Database failure must stop the dependent serving surfaces before exposing
    /// status, since serving ERP requests without durable storage is unsafe.
    pub fn handle_database_failure(&mut self, detail: impl Into<String>) -> Result<(), AgentError> {
        self.status.database.state = ServiceState::Unhealthy;
        self.status.database.detail = detail.into();
        self.status.health = AgentHealth::Unhealthy;
        self.stop_service(ManagedService::Queue)?;
        self.stop_service(ManagedService::Api)?;
        Ok(())
    }

    /// Graceful order is invariant: drain queue, stop API, then stop database.
    pub fn graceful_shutdown(&mut self) -> Result<(), AgentError> {
        self.status.queue.state = ServiceState::Draining;
        self.controller.drain_queue()?;
        self.stop_service(ManagedService::Queue)?;
        self.stop_service(ManagedService::Api)?;
        self.stop_service(ManagedService::Database)?;
        self.status.health = AgentHealth::Degraded;
        Ok(())
    }

    fn start_and_wait(&mut self, service: ManagedService) -> Result<(), AgentError> {
        match service {
            ManagedService::Api if self.status.database.state != ServiceState::Ready => {
                return Err(AgentError::DependencyUnavailable(ManagedService::Database))
            }
            ManagedService::Queue if self.status.api.state != ServiceState::Ready => {
                return Err(AgentError::DependencyUnavailable(ManagedService::Api))
            }
            _ => {}
        }
        self.set_state(service, ServiceState::Starting, "starting");
        self.controller.start(service)?;
        if !self.controller.is_ready(service)? {
            self.set_state(service, ServiceState::Unhealthy, "readiness gate failed");
            return Err(AgentError::ServiceFailure {
                service,
                detail: "readiness gate failed".into(),
            });
        }
        self.set_state(service, ServiceState::Ready, "ready");
        Ok(())
    }

    fn stop_service(&mut self, service: ManagedService) -> Result<(), AgentError> {
        if self.service_status(service).state != ServiceState::Stopped {
            self.controller.stop(service)?;
        }
        self.set_state(service, ServiceState::Stopped, "stopped");
        Ok(())
    }

    fn refresh_health(&mut self) -> Result<(), AgentError> {
        for service in [
            ManagedService::Database,
            ManagedService::Api,
            ManagedService::Queue,
        ] {
            if self.service_status(service).state == ServiceState::Ready
                && !self.controller.is_ready(service)?
            {
                self.set_state(service, ServiceState::Unhealthy, "health check failed");
            }
        }
        self.status.health = if self.status.database.state == ServiceState::Unhealthy {
            AgentHealth::Unhealthy
        } else if [self.status.api.state, self.status.queue.state]
            .iter()
            .all(|state| *state == ServiceState::Ready)
        {
            AgentHealth::Healthy
        } else {
            AgentHealth::Degraded
        };
        Ok(())
    }

    fn service_status(&self, service: ManagedService) -> &ServiceStatus {
        match service {
            ManagedService::Database => &self.status.database,
            ManagedService::Api => &self.status.api,
            ManagedService::Queue => &self.status.queue,
        }
    }

    fn set_state(
        &mut self,
        service: ManagedService,
        state: ServiceState,
        detail: impl Into<String>,
    ) {
        let target = match service {
            ManagedService::Database => &mut self.status.database,
            ManagedService::Api => &mut self.status.api,
            ManagedService::Queue => &mut self.status.queue,
        };
        target.state = state;
        target.detail = detail.into();
    }
}

fn status(service: ManagedService) -> ServiceStatus {
    ServiceStatus {
        service,
        state: ServiceState::Stopped,
        restart_attempts: 0,
        detail: "not started".into(),
    }
}

#[cfg(test)]
mod tests {
    use std::collections::{BTreeMap, VecDeque};

    use super::*;

    struct FakeRuntime {
        ready: BTreeMap<ManagedService, bool>,
        calls: VecDeque<String>,
    }

    impl FakeRuntime {
        fn new() -> Self {
            Self {
                ready: BTreeMap::new(),
                calls: VecDeque::new(),
            }
        }
    }

    impl RuntimeController for FakeRuntime {
        fn start(&mut self, service: ManagedService) -> Result<(), AgentError> {
            self.calls.push_back(format!("start:{service:?}"));
            self.ready.insert(service, true);
            Ok(())
        }
        fn stop(&mut self, service: ManagedService) -> Result<(), AgentError> {
            self.calls.push_back(format!("stop:{service:?}"));
            self.ready.insert(service, false);
            Ok(())
        }
        fn drain_queue(&mut self) -> Result<(), AgentError> {
            self.calls.push_back("drain:Queue".into());
            Ok(())
        }
        fn is_ready(&mut self, service: ManagedService) -> Result<bool, AgentError> {
            Ok(self.ready.get(&service).copied().unwrap_or(false))
        }
    }

    #[test]
    fn starts_in_dependency_order_and_stops_in_reverse_safe_order() {
        let mut agent = ServerAgent::new(FakeRuntime::new());
        agent.start_all().unwrap();
        agent.graceful_shutdown().unwrap();
        assert_eq!(
            agent.controller.calls.into_iter().collect::<Vec<_>>(),
            vec![
                "start:Database",
                "start:Api",
                "start:Queue",
                "drain:Queue",
                "stop:Queue",
                "stop:Api",
                "stop:Database"
            ]
        );
    }

    #[test]
    fn api_restarts_without_stopping_database() {
        let mut agent = ServerAgent::new(FakeRuntime::new());
        agent.start_all().unwrap();
        agent.handle_api_failure("worker exited").unwrap();
        assert_eq!(agent.status().database.state, ServiceState::Ready);
        assert_eq!(agent.status().api.restart_attempts, 1);
    }

    #[test]
    fn database_failure_stops_dependent_services() {
        let mut agent = ServerAgent::new(FakeRuntime::new());
        agent.start_all().unwrap();
        agent
            .handle_database_failure("health probe failed")
            .unwrap();
        assert_eq!(agent.status().health, AgentHealth::Unhealthy);
        assert_eq!(agent.status().api.state, ServiceState::Stopped);
        assert_eq!(agent.status().queue.state, ServiceState::Stopped);
    }

    #[test]
    fn local_endpoint_rejects_untrusted_users() {
        let endpoint = LocalControlEndpoint::platform_default();
        let mut agent = ServerAgent::new(FakeRuntime::new());
        assert_eq!(
            agent.execute(
                &endpoint,
                LocalIdentity::UnprivilegedUser,
                AgentCommand::Start
            ),
            Err(AgentError::Unauthorized)
        );
        assert_eq!(
            agent.execute(&endpoint, LocalIdentity::RemotePeer, AgentCommand::Status),
            Err(AgentError::Unauthorized)
        );
    }
}
