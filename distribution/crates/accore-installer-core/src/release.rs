use std::{
    fmt, fs,
    io::Write,
    path::{Path, PathBuf},
};

use semver::Version;
use serde::{Deserialize, Serialize};

/// A traceable release selected only after manifest signature and artifact digest
/// verification have completed in the distribution boundary.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ServerReleasePlan {
    pub version: Version,
    pub source_revision: String,
}

/// Durable, operator-visible state for every release transaction boundary.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ServerReleaseState {
    Staging,
    PreflightPassed,
    BackupCreated,
    Maintenance,
    MigrationComplete,
    RuntimeActivated,
    Healthy,
    RolledBack,
    RecoveryRequired,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReleaseLedgerEntry {
    pub release_version: String,
    pub source_revision: String,
    pub state: ServerReleaseState,
    pub recorded_at: String,
    pub detail: String,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReleaseLedger {
    entries: Vec<ReleaseLedgerEntry>,
}

impl ReleaseLedger {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, ServerReleaseError> {
        let path = path.as_ref();
        if !path.exists() {
            return Ok(Self::default());
        }
        let bytes = fs::read(path).map_err(ServerReleaseError::io)?;
        serde_json::from_slice(&bytes)
            .map_err(|error| ServerReleaseError::Ledger(error.to_string()))
    }

    pub fn entries(&self) -> &[ReleaseLedgerEntry] {
        &self.entries
    }

    pub fn record(
        &mut self,
        release: &ServerReleasePlan,
        state: ServerReleaseState,
        now: impl Into<String>,
        detail: impl Into<String>,
    ) {
        self.entries.push(ReleaseLedgerEntry {
            release_version: release.version.to_string(),
            source_revision: release.source_revision.clone(),
            state,
            recorded_at: now.into(),
            detail: detail.into(),
        });
    }

    pub fn save_atomic(&self, path: impl AsRef<Path>) -> Result<(), ServerReleaseError> {
        let path = path.as_ref();
        let parent = path.parent().ok_or_else(|| {
            ServerReleaseError::Ledger("release ledger requires a parent directory".into())
        })?;
        fs::create_dir_all(parent).map_err(ServerReleaseError::io)?;
        let temporary = temporary_path(path);
        let bytes = serde_json::to_vec_pretty(self)
            .map_err(|error| ServerReleaseError::Ledger(error.to_string()))?;
        let mut staged = fs::File::create(&temporary).map_err(ServerReleaseError::io)?;
        staged.write_all(&bytes).map_err(ServerReleaseError::io)?;
        staged.sync_all().map_err(ServerReleaseError::io)?;
        drop(staged);
        fs::rename(&temporary, path).map_err(ServerReleaseError::io)
    }
}

/// The platform adapter owns real process, database, backup and service operations.
/// This transaction owns the safe order and prevents success from being reported
/// until the restarted runtime is healthy.
pub trait ServerReleasePlatform {
    fn stage_verified_release(
        &mut self,
        release: &ServerReleasePlan,
    ) -> Result<(), ServerReleaseError>;
    fn preflight(&mut self, release: &ServerReleasePlan) -> Result<(), ServerReleaseError>;
    fn create_backup_checkpoint(
        &mut self,
        release: &ServerReleasePlan,
    ) -> Result<(), ServerReleaseError>;
    fn enter_maintenance(&mut self, release: &ServerReleasePlan) -> Result<(), ServerReleaseError>;
    fn migrate(&mut self, release: &ServerReleasePlan) -> Result<(), ServerReleaseError>;
    fn activate_release(&mut self, release: &ServerReleasePlan) -> Result<(), ServerReleaseError>;
    fn health_check(&mut self, release: &ServerReleasePlan) -> Result<(), ServerReleaseError>;
    fn leave_maintenance(&mut self, release: &ServerReleasePlan) -> Result<(), ServerReleaseError>;
    fn reactivate_prior_healthy_runtime(&mut self) -> Result<(), ServerReleaseError>;
    fn enter_recovery_maintenance(&mut self, detail: &str) -> Result<(), ServerReleaseError>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ServerReleaseError {
    Platform(String),
    Ledger(String),
    Io(String),
    PreMigrationRollbackFailed { cause: String, rollback: String },
    PostMigrationRecoveryRequired(String),
}

impl ServerReleaseError {
    pub fn platform(detail: impl Into<String>) -> Self {
        Self::Platform(detail.into())
    }

    fn io(error: std::io::Error) -> Self {
        Self::Io(error.to_string())
    }
}

impl fmt::Display for ServerReleaseError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Platform(detail) => write!(formatter, "server release platform error: {detail}"),
            Self::Ledger(detail) => write!(formatter, "server release ledger error: {detail}"),
            Self::Io(detail) => write!(formatter, "server release I/O error: {detail}"),
            Self::PreMigrationRollbackFailed { cause, rollback } => write!(
                formatter,
                "pre-migration release failure ({cause}) and prior runtime reactivation failed ({rollback})"
            ),
            Self::PostMigrationRecoveryRequired(detail) => write!(
                formatter,
                "release entered recovery maintenance after migration: {detail}"
            ),
        }
    }
}

impl std::error::Error for ServerReleaseError {}

/// Coordinates server updates. `now` is supplied by the caller so ledger records
/// are deterministic in tests and auditable in production.
pub struct ServerReleaseTransaction {
    ledger_path: PathBuf,
    ledger: ReleaseLedger,
}

impl ServerReleaseTransaction {
    pub fn open(ledger_path: impl Into<PathBuf>) -> Result<Self, ServerReleaseError> {
        let ledger_path = ledger_path.into();
        let ledger = ReleaseLedger::open(&ledger_path)?;
        Ok(Self {
            ledger_path,
            ledger,
        })
    }

    pub fn ledger(&self) -> &ReleaseLedger {
        &self.ledger
    }

    pub fn apply<P: ServerReleasePlatform>(
        &mut self,
        platform: &mut P,
        release: &ServerReleasePlan,
        now: impl Fn() -> String,
    ) -> Result<(), ServerReleaseError> {
        self.run_pre_migration(
            platform,
            release,
            ServerReleaseState::Staging,
            &now,
            |platform| platform.stage_verified_release(release),
        )?;
        self.run_pre_migration(
            platform,
            release,
            ServerReleaseState::PreflightPassed,
            &now,
            |platform| platform.preflight(release),
        )?;
        self.run_pre_migration(
            platform,
            release,
            ServerReleaseState::BackupCreated,
            &now,
            |platform| platform.create_backup_checkpoint(release),
        )?;
        self.run_pre_migration(
            platform,
            release,
            ServerReleaseState::Maintenance,
            &now,
            |platform| platform.enter_maintenance(release),
        )?;

        if let Err(error) = platform.migrate(release) {
            return self.recovery_required(platform, release, &now, error);
        }
        self.record(
            release,
            ServerReleaseState::MigrationComplete,
            now(),
            "migration completed",
        )?;

        if let Err(error) = platform.activate_release(release) {
            return self.recovery_required(platform, release, &now, error);
        }
        self.record(
            release,
            ServerReleaseState::RuntimeActivated,
            now(),
            "runtime activated",
        )?;

        if let Err(error) = platform.health_check(release) {
            return self.recovery_required(platform, release, &now, error);
        }

        if let Err(error) = platform.leave_maintenance(release) {
            return self.recovery_required(platform, release, &now, error);
        }
        self.record(
            release,
            ServerReleaseState::Healthy,
            now(),
            "runtime healthy and maintenance cleared",
        )
    }

    fn run_pre_migration<P: ServerReleasePlatform>(
        &mut self,
        platform: &mut P,
        release: &ServerReleasePlan,
        state: ServerReleaseState,
        now: &impl Fn() -> String,
        operation: impl FnOnce(&mut P) -> Result<(), ServerReleaseError>,
    ) -> Result<(), ServerReleaseError> {
        match operation(platform) {
            Ok(()) => self.record(release, state, now(), state_detail(state)),
            Err(error) => self.rollback_prior_runtime(platform, release, now, error),
        }
    }

    fn rollback_prior_runtime<P: ServerReleasePlatform>(
        &mut self,
        platform: &mut P,
        release: &ServerReleasePlan,
        now: &impl Fn() -> String,
        cause: ServerReleaseError,
    ) -> Result<(), ServerReleaseError> {
        let cause_detail = cause.to_string();
        match platform.reactivate_prior_healthy_runtime() {
            Ok(()) => {
                self.record(
                    release,
                    ServerReleaseState::RolledBack,
                    now(),
                    format!("prior healthy runtime reactivated after pre-migration failure: {cause_detail}"),
                )?;
                Err(cause)
            }
            Err(rollback) => {
                let rollback_detail = rollback.to_string();
                self.record(
                    release,
                    ServerReleaseState::RecoveryRequired,
                    now(),
                    format!(
                        "pre-migration failure: {cause_detail}; rollback failed: {rollback_detail}"
                    ),
                )?;
                Err(ServerReleaseError::PreMigrationRollbackFailed {
                    cause: cause_detail,
                    rollback: rollback_detail,
                })
            }
        }
    }

    fn recovery_required<P: ServerReleasePlatform>(
        &mut self,
        platform: &mut P,
        release: &ServerReleasePlan,
        now: &impl Fn() -> String,
        cause: ServerReleaseError,
    ) -> Result<(), ServerReleaseError> {
        let detail = cause.to_string();
        if let Err(maintenance_error) = platform.enter_recovery_maintenance(&detail) {
            let combined = format!("{detail}; recovery maintenance failed: {maintenance_error}");
            self.record(
                release,
                ServerReleaseState::RecoveryRequired,
                now(),
                combined.clone(),
            )?;
            return Err(ServerReleaseError::PostMigrationRecoveryRequired(combined));
        }
        self.record(
            release,
            ServerReleaseState::RecoveryRequired,
            now(),
            detail.clone(),
        )?;
        Err(ServerReleaseError::PostMigrationRecoveryRequired(detail))
    }

    fn record(
        &mut self,
        release: &ServerReleasePlan,
        state: ServerReleaseState,
        now: String,
        detail: impl Into<String>,
    ) -> Result<(), ServerReleaseError> {
        self.ledger.record(release, state, now, detail);
        self.ledger.save_atomic(&self.ledger_path)
    }
}

fn state_detail(state: ServerReleaseState) -> &'static str {
    match state {
        ServerReleaseState::Staging => "verified release staged",
        ServerReleaseState::PreflightPassed => "preflight passed",
        ServerReleaseState::BackupCreated => "backup checkpoint created",
        ServerReleaseState::Maintenance => "maintenance enabled",
        ServerReleaseState::MigrationComplete => "migration completed",
        ServerReleaseState::RuntimeActivated => "runtime activated",
        ServerReleaseState::Healthy => "runtime healthy",
        ServerReleaseState::RolledBack => "prior runtime restored",
        ServerReleaseState::RecoveryRequired => "recovery required",
    }
}

fn temporary_path(path: &Path) -> PathBuf {
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("release-ledger.json");
    path.with_file_name(format!(".{file_name}.tmp"))
}

#[cfg(test)]
mod tests {
    use std::{
        collections::BTreeSet,
        env, fs,
        time::{SystemTime, UNIX_EPOCH},
    };

    use super::*;

    #[derive(Default)]
    struct FakePlatform {
        calls: Vec<&'static str>,
        failures: BTreeSet<&'static str>,
    }

    impl FakePlatform {
        fn fail(operation: &'static str) -> Self {
            let mut platform = Self::default();
            platform.failures.insert(operation);
            platform
        }

        fn run(&mut self, operation: &'static str) -> Result<(), ServerReleaseError> {
            self.calls.push(operation);
            if self.failures.contains(operation) {
                Err(ServerReleaseError::platform(format!("{operation} failed")))
            } else {
                Ok(())
            }
        }
    }

    impl ServerReleasePlatform for FakePlatform {
        fn stage_verified_release(
            &mut self,
            _: &ServerReleasePlan,
        ) -> Result<(), ServerReleaseError> {
            self.run("stage")
        }
        fn preflight(&mut self, _: &ServerReleasePlan) -> Result<(), ServerReleaseError> {
            self.run("preflight")
        }
        fn create_backup_checkpoint(
            &mut self,
            _: &ServerReleasePlan,
        ) -> Result<(), ServerReleaseError> {
            self.run("backup")
        }
        fn enter_maintenance(&mut self, _: &ServerReleasePlan) -> Result<(), ServerReleaseError> {
            self.run("maintenance")
        }
        fn migrate(&mut self, _: &ServerReleasePlan) -> Result<(), ServerReleaseError> {
            self.run("migrate")
        }
        fn activate_release(&mut self, _: &ServerReleasePlan) -> Result<(), ServerReleaseError> {
            self.run("activate")
        }
        fn health_check(&mut self, _: &ServerReleasePlan) -> Result<(), ServerReleaseError> {
            self.run("health")
        }
        fn leave_maintenance(&mut self, _: &ServerReleasePlan) -> Result<(), ServerReleaseError> {
            self.run("leave-maintenance")
        }
        fn reactivate_prior_healthy_runtime(&mut self) -> Result<(), ServerReleaseError> {
            self.run("reactivate-prior")
        }
        fn enter_recovery_maintenance(&mut self, _: &str) -> Result<(), ServerReleaseError> {
            self.run("recovery-maintenance")
        }
    }

    fn release() -> ServerReleasePlan {
        ServerReleasePlan {
            version: Version::parse("1.4.0").unwrap(),
            source_revision: "a".repeat(40),
        }
    }

    fn ledger_path(test_name: &str) -> PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        env::temp_dir()
            .join(format!("accore-{test_name}-{unique}"))
            .join("ledger.json")
    }

    #[test]
    fn successful_release_records_backup_before_migration_and_only_reports_healthy_last() {
        let ledger_path = ledger_path("successful-release");
        let mut transaction = ServerReleaseTransaction::open(&ledger_path).unwrap();
        let mut platform = FakePlatform::default();
        transaction
            .apply(&mut platform, &release(), || "2026-08-18T21:00:00Z".into())
            .unwrap();

        assert_eq!(
            platform.calls,
            vec![
                "stage",
                "preflight",
                "backup",
                "maintenance",
                "migrate",
                "activate",
                "health",
                "leave-maintenance"
            ]
        );
        assert_eq!(
            transaction
                .ledger()
                .entries()
                .iter()
                .map(|entry| entry.state)
                .collect::<Vec<_>>(),
            vec![
                ServerReleaseState::Staging,
                ServerReleaseState::PreflightPassed,
                ServerReleaseState::BackupCreated,
                ServerReleaseState::Maintenance,
                ServerReleaseState::MigrationComplete,
                ServerReleaseState::RuntimeActivated,
                ServerReleaseState::Healthy,
            ]
        );
        let restored = ReleaseLedger::open(&ledger_path).unwrap();
        assert_eq!(restored, *transaction.ledger());
        fs::remove_dir_all(ledger_path.parent().unwrap()).unwrap();
    }

    #[test]
    fn pre_migration_failure_reactivates_prior_healthy_runtime_and_never_migrates() {
        let ledger_path = ledger_path("preflight-failure");
        let mut transaction = ServerReleaseTransaction::open(&ledger_path).unwrap();
        let mut platform = FakePlatform::fail("preflight");
        assert!(matches!(
            transaction.apply(&mut platform, &release(), || "now".into()),
            Err(ServerReleaseError::Platform(_))
        ));
        assert_eq!(
            platform.calls,
            vec!["stage", "preflight", "reactivate-prior"]
        );
        assert_eq!(
            transaction.ledger().entries().last().unwrap().state,
            ServerReleaseState::RolledBack
        );
        fs::remove_dir_all(ledger_path.parent().unwrap()).unwrap();
    }

    #[test]
    fn post_migration_failure_requires_recovery_and_never_reports_success() {
        let ledger_path = ledger_path("health-failure");
        let mut transaction = ServerReleaseTransaction::open(&ledger_path).unwrap();
        let mut platform = FakePlatform::fail("health");
        assert!(matches!(
            transaction.apply(&mut platform, &release(), || "now".into()),
            Err(ServerReleaseError::PostMigrationRecoveryRequired(_))
        ));
        assert_eq!(
            platform.calls,
            vec![
                "stage",
                "preflight",
                "backup",
                "maintenance",
                "migrate",
                "activate",
                "health",
                "recovery-maintenance"
            ]
        );
        assert_eq!(
            transaction.ledger().entries().last().unwrap().state,
            ServerReleaseState::RecoveryRequired
        );
        assert!(!transaction
            .ledger()
            .entries()
            .iter()
            .any(|entry| entry.state == ServerReleaseState::Healthy));
        fs::remove_dir_all(ledger_path.parent().unwrap()).unwrap();
    }
}
