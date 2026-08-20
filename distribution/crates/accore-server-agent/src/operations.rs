use std::collections::BTreeMap;

use crate::AgentError;

/// Every dependency an operator must be able to reason about without opening raw logs.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum HealthComponent {
    Agent,
    Database,
    Api,
    Queue,
    Storage,
    Backup,
    Schema,
    ClientCompatibility,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum ComponentHealthState {
    Healthy,
    Attention,
    Failed,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComponentHealth {
    pub component: HealthComponent,
    pub state: ComponentHealthState,
    /// Safe operator summary; it must never contain raw logs, credentials, or tokens.
    pub summary: String,
    /// A concrete next action suitable for the Server Desktop operations surface.
    pub recommended_action: String,
    pub observed_at_unix: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OperationalHealthReport {
    pub overall: ComponentHealthState,
    pub components: BTreeMap<HealthComponent, ComponentHealth>,
}

impl OperationalHealthReport {
    pub fn new(items: impl IntoIterator<Item = ComponentHealth>) -> Self {
        let components = items
            .into_iter()
            .map(|item| (item.component, item))
            .collect::<BTreeMap<_, _>>();
        let overall = components
            .values()
            .map(|item| item.state)
            .max()
            .unwrap_or(ComponentHealthState::Attention);
        Self {
            overall,
            components,
        }
    }

    pub fn component(&self, component: HealthComponent) -> Option<&ComponentHealth> {
        self.components.get(&component)
    }

    pub fn first_actionable_failure(&self) -> Option<&ComponentHealth> {
        self.components
            .values()
            .find(|item| item.state == ComponentHealthState::Failed)
            .or_else(|| {
                self.components
                    .values()
                    .find(|item| item.state == ComponentHealthState::Attention)
            })
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OperationalEventKind {
    Setup,
    Pairing,
    Lifecycle,
    Backup,
    RestoreVerification,
    Update,
    SupportBundle,
    Retention,
}

/// Audit entries deliberately contain an outcome and safe reference, not command output.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OperationalAuditEvent {
    pub kind: OperationalEventKind,
    pub outcome: String,
    pub occurred_at_unix: u64,
    pub safe_reference: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BackupRetentionPolicy {
    pub keep_latest: usize,
    pub maximum_age_seconds: u64,
    pub restore_verification_interval_seconds: u64,
}

impl Default for BackupRetentionPolicy {
    fn default() -> Self {
        Self {
            keep_latest: 14,
            maximum_age_seconds: 30 * 24 * 60 * 60,
            restore_verification_interval_seconds: 7 * 24 * 60 * 60,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct BackupSchedule {
    pub interval_seconds: u64,
}

impl BackupSchedule {
    pub fn is_due(&self, latest: Option<&BackupRecord>, now_unix: u64) -> bool {
        latest
            .map(|record| now_unix.saturating_sub(record.created_at_unix) >= self.interval_seconds)
            .unwrap_or(true)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BackupRecord {
    pub id: String,
    pub created_at_unix: u64,
    pub verified_at_unix: Option<u64>,
    pub size_bytes: u64,
}

impl BackupRetentionPolicy {
    /// Returns only records that exceed both the minimum count and retention age.
    /// This prevents rotation from deleting the most recent restore point.
    pub fn prune_candidates<'a>(
        &self,
        records: &'a [BackupRecord],
        now_unix: u64,
    ) -> Vec<&'a BackupRecord> {
        let mut ordered = records.iter().collect::<Vec<_>>();
        ordered.sort_by(|left, right| right.created_at_unix.cmp(&left.created_at_unix));
        ordered
            .into_iter()
            .enumerate()
            .filter_map(|(index, record)| {
                let age = now_unix.saturating_sub(record.created_at_unix);
                (index >= self.keep_latest && age >= self.maximum_age_seconds).then_some(record)
            })
            .collect()
    }

    pub fn requires_restore_verification(&self, record: &BackupRecord, now_unix: u64) -> bool {
        match record.verified_at_unix {
            None => true,
            Some(verified_at) => {
                now_unix.saturating_sub(verified_at) >= self.restore_verification_interval_seconds
            }
        }
    }
}

/// Platform adapters run packaged database tools in an isolated validation directory.
/// They never expose passwords, command lines, or raw database output through this trait.
pub trait BackupOperator {
    fn create_backup(&mut self, backup_id: &str) -> Result<u64, AgentError>;
    fn verify_restore_isolated(&mut self, backup_id: &str) -> Result<(), AgentError>;
    fn remove_backup(&mut self, backup_id: &str) -> Result<(), AgentError>;
}

pub struct BackupSupervisor<O: BackupOperator> {
    operator: O,
    policy: BackupRetentionPolicy,
    records: Vec<BackupRecord>,
    audit: Vec<OperationalAuditEvent>,
}

impl<O: BackupOperator> BackupSupervisor<O> {
    pub fn new(operator: O, policy: BackupRetentionPolicy) -> Self {
        Self {
            operator,
            policy,
            records: Vec::new(),
            audit: Vec::new(),
        }
    }

    /// Rehydrates durable restore-point metadata after an Agent restart. Audit history
    /// is deliberately persisted separately as an append-only protected log.
    pub fn with_records(
        operator: O,
        policy: BackupRetentionPolicy,
        records: Vec<BackupRecord>,
    ) -> Self {
        Self {
            operator,
            policy,
            records,
            audit: Vec::new(),
        }
    }

    pub fn records(&self) -> &[BackupRecord] {
        &self.records
    }
    pub fn audit(&self) -> &[OperationalAuditEvent] {
        &self.audit
    }

    /// Supports both scheduled and administrator-initiated runs. A verification
    /// failure is reported but the retained backup remains available for diagnosis.
    pub fn create_and_verify(
        &mut self,
        backup_id: impl Into<String>,
        now_unix: u64,
    ) -> Result<(), AgentError> {
        let backup_id = backup_id.into();
        let size_bytes = self.operator.create_backup(&backup_id)?;
        self.records.push(BackupRecord {
            id: backup_id.clone(),
            created_at_unix: now_unix,
            verified_at_unix: None,
            size_bytes,
        });
        self.record_audit(
            OperationalEventKind::Backup,
            "success",
            now_unix,
            format!("backup:{backup_id}"),
        );
        self.verify_due(now_unix)
    }

    pub fn verify_due(&mut self, now_unix: u64) -> Result<(), AgentError> {
        let due = self
            .records
            .iter()
            .filter(|record| self.policy.requires_restore_verification(record, now_unix))
            .map(|record| record.id.clone())
            .collect::<Vec<_>>();
        for backup_id in due {
            match self.operator.verify_restore_isolated(&backup_id) {
                Ok(()) => {
                    if let Some(record) = self
                        .records
                        .iter_mut()
                        .find(|record| record.id == backup_id)
                    {
                        record.verified_at_unix = Some(now_unix);
                    }
                    self.record_audit(
                        OperationalEventKind::RestoreVerification,
                        "success",
                        now_unix,
                        format!("backup:{backup_id}"),
                    );
                }
                Err(error) => {
                    self.record_audit(
                        OperationalEventKind::RestoreVerification,
                        "failed",
                        now_unix,
                        format!("backup:{backup_id}"),
                    );
                    return Err(error);
                }
            }
        }
        Ok(())
    }

    pub fn enforce_retention(&mut self, now_unix: u64) -> Result<(), AgentError> {
        let candidates = self
            .policy
            .prune_candidates(&self.records, now_unix)
            .into_iter()
            .map(|record| record.id.clone())
            .collect::<Vec<_>>();
        for backup_id in candidates {
            self.operator.remove_backup(&backup_id)?;
            self.records.retain(|record| record.id != backup_id);
            self.record_audit(
                OperationalEventKind::Retention,
                "success",
                now_unix,
                format!("backup:{backup_id}"),
            );
        }
        Ok(())
    }

    fn record_audit(
        &mut self,
        kind: OperationalEventKind,
        outcome: &str,
        occurred_at_unix: u64,
        safe_reference: String,
    ) {
        self.audit.push(OperationalAuditEvent {
            kind,
            outcome: outcome.into(),
            occurred_at_unix,
            safe_reference,
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Default)]
    struct FakeBackupOperator {
        calls: Vec<String>,
        fail_verification: bool,
    }

    impl BackupOperator for FakeBackupOperator {
        fn create_backup(&mut self, backup_id: &str) -> Result<u64, AgentError> {
            self.calls.push(format!("create:{backup_id}"));
            Ok(256)
        }
        fn verify_restore_isolated(&mut self, backup_id: &str) -> Result<(), AgentError> {
            self.calls.push(format!("verify:{backup_id}"));
            if self.fail_verification {
                Err(AgentError::ServiceFailure {
                    service: crate::ManagedService::Database,
                    detail: "restore validation failed".into(),
                })
            } else {
                Ok(())
            }
        }
        fn remove_backup(&mut self, backup_id: &str) -> Result<(), AgentError> {
            self.calls.push(format!("remove:{backup_id}"));
            Ok(())
        }
    }

    #[test]
    fn health_report_exposes_component_and_recommended_action() {
        let report = OperationalHealthReport::new([
            ComponentHealth {
                component: HealthComponent::Database,
                state: ComponentHealthState::Healthy,
                summary: "database responds".into(),
                recommended_action: "none".into(),
                observed_at_unix: 1,
            },
            ComponentHealth {
                component: HealthComponent::Backup,
                state: ComponentHealthState::Failed,
                summary: "latest restore validation failed".into(),
                recommended_action: "run restore runbook and retain backup".into(),
                observed_at_unix: 2,
            },
        ]);
        assert_eq!(report.overall, ComponentHealthState::Failed);
        assert_eq!(
            report.first_actionable_failure().unwrap().component,
            HealthComponent::Backup
        );
    }

    #[test]
    fn creates_then_restores_in_isolated_validation_before_reporting_success() {
        let mut supervisor = BackupSupervisor::new(
            FakeBackupOperator::default(),
            BackupRetentionPolicy::default(),
        );
        supervisor.create_and_verify("backup-1", 100).unwrap();
        assert_eq!(supervisor.records()[0].verified_at_unix, Some(100));
        assert_eq!(
            supervisor.operator.calls,
            vec!["create:backup-1", "verify:backup-1"]
        );
        assert_eq!(
            supervisor.audit()[1].kind,
            OperationalEventKind::RestoreVerification
        );
    }

    #[test]
    fn failed_restore_validation_is_audited_and_never_marked_verified() {
        let mut supervisor = BackupSupervisor::new(
            FakeBackupOperator {
                fail_verification: true,
                ..Default::default()
            },
            BackupRetentionPolicy::default(),
        );
        assert!(supervisor.create_and_verify("backup-1", 100).is_err());
        assert_eq!(supervisor.records()[0].verified_at_unix, None);
        assert_eq!(supervisor.audit().last().unwrap().outcome, "failed");
    }

    #[test]
    fn schedule_is_due_for_a_first_backup_and_after_the_configured_interval() {
        let schedule = BackupSchedule {
            interval_seconds: 60,
        };
        let record = BackupRecord {
            id: "backup-1".into(),
            created_at_unix: 100,
            verified_at_unix: Some(100),
            size_bytes: 1,
        };
        assert!(schedule.is_due(None, 100));
        assert!(!schedule.is_due(Some(&record), 159));
        assert!(schedule.is_due(Some(&record), 160));
    }

    #[test]
    fn retention_never_deletes_the_latest_required_restore_points() {
        let policy = BackupRetentionPolicy {
            keep_latest: 2,
            maximum_age_seconds: 10,
            restore_verification_interval_seconds: 10,
        };
        let records = vec![
            BackupRecord {
                id: "latest".into(),
                created_at_unix: 100,
                verified_at_unix: Some(100),
                size_bytes: 1,
            },
            BackupRecord {
                id: "second".into(),
                created_at_unix: 90,
                verified_at_unix: Some(90),
                size_bytes: 1,
            },
            BackupRecord {
                id: "expired".into(),
                created_at_unix: 10,
                verified_at_unix: Some(10),
                size_bytes: 1,
            },
        ];
        assert_eq!(
            policy
                .prune_candidates(&records, 101)
                .iter()
                .map(|record| record.id.as_str())
                .collect::<Vec<_>>(),
            vec!["expired"]
        );
    }
}
