use serde::{Deserialize, Serialize};

/// Stable installer stages. The ordering is deliberately explicit so UI clients
/// can render real stage transitions rather than inferring progress from text.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum InstallStage {
    Manifest,
    Download,
    Verify,
    Extract,
    ServiceRegistration,
    FirstRun,
    HealthCheck,
    Complete,
    Rollback,
}

/// Structured installation state emitted to UI, logs, and support bundles.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct ProgressSnapshot {
    pub stage: InstallStage,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub artifact_id: Option<String>,
    #[serde(default)]
    pub completed_bytes: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub total_bytes: Option<u64>,
    #[serde(default)]
    pub manifest_verified: bool,
    #[serde(default)]
    pub artifact_verified: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub service_state: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub migration_state: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
}

impl ProgressSnapshot {
    pub fn for_stage(stage: InstallStage) -> Self {
        Self {
            stage,
            artifact_id: None,
            completed_bytes: 0,
            total_bytes: None,
            manifest_verified: false,
            artifact_verified: false,
            service_state: None,
            migration_state: None,
            detail: None,
        }
    }

    pub fn percentage(&self) -> Option<u8> {
        self.total_bytes.and_then(|total| {
            if total == 0 {
                None
            } else {
                Some(((self.completed_bytes.saturating_mul(100) / total).min(100)) as u8)
            }
        })
    }
}

/// Event payload carried by the `installer-progress` Tauri event.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct InstallProgressEvent {
    pub installation_id: String,
    pub sequence: u64,
    pub snapshot: ProgressSnapshot,
}

/// Runtime-specific adapters, including Tauri, implement this small bridge.
pub trait InstallerProgressReporter: Send + Sync {
    fn emit(&self, event: &InstallProgressEvent);
}

#[cfg(test)]
mod tests {
    use super::{InstallStage, ProgressSnapshot};

    #[test]
    fn progress_percentage_is_bounded_and_omits_unknown_totals() {
        let mut snapshot = ProgressSnapshot::for_stage(InstallStage::Download);
        assert_eq!(snapshot.percentage(), None);

        snapshot.total_bytes = Some(100);
        snapshot.completed_bytes = 125;
        assert_eq!(snapshot.percentage(), Some(100));
    }
}
