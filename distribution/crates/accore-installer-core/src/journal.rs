use std::{
    fmt,
    fs::{self, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};

use crate::{InstallStage, ProductFlavor, ProgressSnapshot};

const JOURNAL_SCHEMA_VERSION: u16 = 1;

/// Durable boundaries at which an interrupted installation can be resumed safely.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum JournalStage {
    Download,
    Verify,
    Extract,
    ServiceRegistration,
    FirstRun,
    HealthCheck,
    Complete,
    Rollback,
}

impl From<JournalStage> for InstallStage {
    fn from(stage: JournalStage) -> Self {
        match stage {
            JournalStage::Download => Self::Download,
            JournalStage::Verify => Self::Verify,
            JournalStage::Extract => Self::Extract,
            JournalStage::ServiceRegistration => Self::ServiceRegistration,
            JournalStage::FirstRun => Self::FirstRun,
            JournalStage::HealthCheck => Self::HealthCheck,
            JournalStage::Complete => Self::Complete,
            JournalStage::Rollback => Self::Rollback,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct StageCheckpoint {
    pub stage: JournalStage,
    pub complete: bool,
    pub safe_to_resume: bool,
    pub safe_to_rollback: bool,
    pub recorded_at: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub artifact_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct JournalRecord {
    pub schema_version: u16,
    pub installation_id: String,
    pub product: ProductFlavor,
    pub release_version: String,
    pub updated_at: String,
    #[serde(default)]
    pub checkpoints: Vec<StageCheckpoint>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub last_progress: Option<ProgressSnapshot>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RecoveryAction {
    Start,
    Resume(JournalStage),
    RollBack(JournalStage),
    AlreadyComplete,
}

impl JournalRecord {
    pub fn new(
        installation_id: impl Into<String>,
        product: ProductFlavor,
        release_version: impl Into<String>,
        now: impl Into<String>,
    ) -> Self {
        Self {
            schema_version: JOURNAL_SCHEMA_VERSION,
            installation_id: installation_id.into(),
            product,
            release_version: release_version.into(),
            updated_at: now.into(),
            checkpoints: Vec::new(),
            last_progress: None,
        }
    }

    pub fn recovery_action(&self) -> RecoveryAction {
        let Some(last) = self.checkpoints.last() else {
            return RecoveryAction::Start;
        };
        if last.stage == JournalStage::Complete && last.complete {
            return RecoveryAction::AlreadyComplete;
        }
        if last.safe_to_resume {
            return RecoveryAction::Resume(last.stage);
        }
        if last.safe_to_rollback {
            return RecoveryAction::RollBack(last.stage);
        }
        RecoveryAction::RollBack(last.stage)
    }

    pub fn record_checkpoint(&mut self, checkpoint: StageCheckpoint) {
        self.checkpoints.retain(|existing| existing.stage != checkpoint.stage);
        self.checkpoints.push(checkpoint);
        self.checkpoints.sort_by_key(|entry| entry.stage);
    }

    pub fn record_progress(&mut self, progress: ProgressSnapshot, now: impl Into<String>) {
        self.last_progress = Some(progress);
        self.updated_at = now.into();
    }

    pub fn can_report_complete(&self) -> bool {
        self.checkpoints.iter().any(|checkpoint| {
            checkpoint.stage == JournalStage::HealthCheck && checkpoint.complete
        })
    }
}

#[derive(Debug)]
pub enum JournalError {
    Io(String),
    Serialization(String),
    InvalidSchema(u16),
    UnsafeCompletion,
}

impl fmt::Display for JournalError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(message) => write!(formatter, "journal I/O error: {message}"),
            Self::Serialization(message) => write!(formatter, "journal serialization error: {message}"),
            Self::InvalidSchema(version) => write!(formatter, "unsupported journal schema: {version}"),
            Self::UnsafeCompletion => write!(formatter, "installation cannot complete before health checks pass"),
        }
    }
}

impl std::error::Error for JournalError {}

impl From<std::io::Error> for JournalError {
    fn from(error: std::io::Error) -> Self {
        Self::Io(error.to_string())
    }
}

/// Atomic journal persistence scoped under the machine runtime root, never inside
/// customer databases, application configuration, or the immutable object cache.
#[derive(Debug, Clone)]
pub struct InstallationJournal {
    path: PathBuf,
}

impl InstallationJournal {
    pub fn new(runtime_home: impl Into<PathBuf>, installation_id: &str) -> Result<Self, JournalError> {
        if installation_id.is_empty() || installation_id.contains(['/', '\\']) {
            return Err(JournalError::Io("installation identifier is invalid".into()));
        }
        let root = runtime_home.into().join("installer").join("journals");
        fs::create_dir_all(&root)?;
        Ok(Self {
            path: root.join(format!("{installation_id}.json")),
        })
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    pub fn load(&self) -> Result<Option<JournalRecord>, JournalError> {
        if !self.path.exists() {
            return Ok(None);
        }
        let bytes = fs::read(&self.path)?;
        let record: JournalRecord = serde_json::from_slice(&bytes)
            .map_err(|error| JournalError::Serialization(error.to_string()))?;
        if record.schema_version != JOURNAL_SCHEMA_VERSION {
            return Err(JournalError::InvalidSchema(record.schema_version));
        }
        Ok(Some(record))
    }

    pub fn save(&self, record: &JournalRecord) -> Result<(), JournalError> {
        if record.schema_version != JOURNAL_SCHEMA_VERSION {
            return Err(JournalError::InvalidSchema(record.schema_version));
        }
        if record.checkpoints.iter().any(|checkpoint| checkpoint.stage == JournalStage::Complete && checkpoint.complete)
            && !record.can_report_complete()
        {
            return Err(JournalError::UnsafeCompletion);
        }
        let bytes = serde_json::to_vec_pretty(record)
            .map_err(|error| JournalError::Serialization(error.to_string()))?;
        let temporary = self.path.with_extension(format!("tmp-{}", std::process::id()));
        {
            let mut file = OpenOptions::new().create_new(true).write(true).open(&temporary)?;
            file.write_all(&bytes)?;
            file.sync_all()?;
        }
        fs::rename(temporary, &self.path)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::{env, fs, time::{SystemTime, UNIX_EPOCH}};

    use crate::ProductFlavor;
    use super::{InstallationJournal, JournalRecord, JournalStage, RecoveryAction, StageCheckpoint};

    fn temporary_root() -> std::path::PathBuf {
        let nonce = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
        env::temp_dir().join(format!("accore-installer-journal-{nonce}"))
    }

    fn checkpoint(stage: JournalStage, complete: bool, resume: bool, rollback: bool) -> StageCheckpoint {
        StageCheckpoint {
            stage,
            complete,
            safe_to_resume: resume,
            safe_to_rollback: rollback,
            recorded_at: "2026-08-18T00:00:00Z".into(),
            artifact_id: None,
            detail: None,
        }
    }

    #[test]
    fn interrupted_stage_resumes_or_rolls_back_deterministically() {
        let mut record = JournalRecord::new("install-1", ProductFlavor::Server, "1.0.0", "now");
        record.record_checkpoint(checkpoint(JournalStage::Download, false, true, false));
        assert_eq!(record.recovery_action(), RecoveryAction::Resume(JournalStage::Download));

        record.record_checkpoint(checkpoint(JournalStage::ServiceRegistration, false, false, true));
        assert_eq!(record.recovery_action(), RecoveryAction::RollBack(JournalStage::ServiceRegistration));
    }

    #[test]
    fn completion_requires_successful_health_check() {
        let root = temporary_root();
        let journal = InstallationJournal::new(&root, "install-1").unwrap();
        let mut record = JournalRecord::new("install-1", ProductFlavor::Server, "1.0.0", "now");
        record.record_checkpoint(checkpoint(JournalStage::Complete, true, false, false));
        assert!(journal.save(&record).is_err());

        record.record_checkpoint(checkpoint(JournalStage::HealthCheck, true, false, false));
        journal.save(&record).unwrap();
        assert_eq!(journal.load().unwrap().unwrap().recovery_action(), RecoveryAction::AlreadyComplete);
        fs::remove_dir_all(root).unwrap();
    }
}
