use std::{
    fmt,
    io::{Read, Write},
};

use crate::{
    ArtifactCache, ArtifactDescriptor, CacheImportResult, InstallProgressEvent, InstallStage,
    InstallationJournal, JournalError, JournalRecord, JournalStage, ProductFlavor,
    ProgressSnapshot, RecoveryAction,
};

/// Transport abstraction. Production adapters may use HTTPS; tests and offline
/// recovery adapters can supply deterministic streams without weakening manifest
/// or cache verification.
pub trait ArtifactRangeSource {
    fn open_range(
        &mut self,
        artifact: &ArtifactDescriptor,
        offset: u64,
    ) -> Result<Box<dyn Read>, InstallerEngineError>;
}

/// Runtime operations are intentionally separate from download and trust logic.
/// Issue #43 provides the concrete Server Agent lifecycle implementation.
pub trait InstallationPlatform {
    fn extract(&mut self, artifact: &ArtifactDescriptor) -> Result<(), InstallerEngineError>;
    fn register_services(&mut self) -> Result<(), InstallerEngineError>;
    fn run_first_start(&mut self) -> Result<(), InstallerEngineError>;
    fn health_check(&mut self) -> Result<(), InstallerEngineError>;
    fn rollback(&mut self, stage: JournalStage) -> Result<(), InstallerEngineError>;
}

pub trait InstallerEventSink: Send + Sync {
    fn emit(&self, event: &InstallProgressEvent);
}

#[derive(Debug)]
pub enum InstallerEngineError {
    Distribution(String),
    Journal(String),
    Transport(String),
    Platform(String),
    InvalidProduct,
}

impl fmt::Display for InstallerEngineError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Distribution(message) => write!(formatter, "installer distribution error: {message}"),
            Self::Journal(message) => write!(formatter, "installer journal error: {message}"),
            Self::Transport(message) => write!(formatter, "installer transport error: {message}"),
            Self::Platform(message) => write!(formatter, "installer platform error: {message}"),
            Self::InvalidProduct => write!(formatter, "artifact product does not match this installation"),
        }
    }
}

impl std::error::Error for InstallerEngineError {}

impl From<JournalError> for InstallerEngineError {
    fn from(error: JournalError) -> Self {
        Self::Journal(error.to_string())
    }
}

/// Coordinates verified artifact activation and durable platform boundaries.
pub struct InstallerEngine<S: InstallerEventSink> {
    cache: ArtifactCache,
    journal: InstallationJournal,
    record: JournalRecord,
    sink: S,
    sequence: u64,
}

impl<S: InstallerEventSink> InstallerEngine<S> {
    pub fn open(
        cache: ArtifactCache,
        journal: InstallationJournal,
        installation_id: impl Into<String>,
        product: ProductFlavor,
        release_version: impl Into<String>,
        now: impl Into<String>,
        sink: S,
    ) -> Result<Self, InstallerEngineError> {
        let record = journal.load()?.unwrap_or_else(|| {
            JournalRecord::new(installation_id, product, release_version, now)
        });
        Ok(Self {
            cache,
            journal,
            record,
            sink,
            sequence: 0,
        })
    }

    pub fn recovery_action(&self) -> RecoveryAction {
        self.record.recovery_action()
    }

    pub fn record(&self) -> &JournalRecord {
        &self.record
    }

    /// Downloads only the missing bytes into the trusted cache staging object,
    /// then performs the same size and SHA-256 verification used for imports.
    pub fn download_and_verify(
        &mut self,
        source: &mut impl ArtifactRangeSource,
        artifact: &ArtifactDescriptor,
        now: impl Into<String>,
    ) -> Result<CacheImportResult, InstallerEngineError> {
        self.assert_product(artifact)?;
        let now = now.into();
        let offset = self.cache.staged_offset(&artifact.sha256)
            .map_err(|error| InstallerEngineError::Distribution(error.to_string()))?;
        self.boundary(JournalStage::Download, false, true, false, Some(&artifact.id), &now)?;
        self.emit(ProgressSnapshot {
            stage: InstallStage::Download,
            artifact_id: Some(artifact.id.clone()),
            completed_bytes: offset,
            total_bytes: Some(artifact.size_bytes),
            manifest_verified: true,
            artifact_verified: false,
            service_state: None,
            migration_state: None,
            detail: Some("resuming verified artifact transfer".into()),
        }, &now)?;

        let mut stream = source.open_range(artifact, offset)?;
        let mut staging = self.cache.open_staging_for_resume(&artifact.sha256)
            .map_err(|error| InstallerEngineError::Distribution(error.to_string()))?;
        let mut completed = offset;
        let mut buffer = [0_u8; 64 * 1024];
        loop {
            let count = stream.read(&mut buffer).map_err(|error| InstallerEngineError::Transport(error.to_string()))?;
            if count == 0 {
                break;
            }
            staging.write_all(&buffer[..count]).map_err(|error| InstallerEngineError::Transport(error.to_string()))?;
            completed = completed.saturating_add(count as u64);
            self.emit(ProgressSnapshot {
                stage: InstallStage::Download,
                artifact_id: Some(artifact.id.clone()),
                completed_bytes: completed,
                total_bytes: Some(artifact.size_bytes),
                manifest_verified: true,
                artifact_verified: false,
                service_state: None,
                migration_state: None,
                detail: None,
            }, &now)?;
        }
        staging.sync_all().map_err(|error| InstallerEngineError::Transport(error.to_string()))?;

        self.boundary(JournalStage::Verify, false, true, false, Some(&artifact.id), &now)?;
        self.emit(ProgressSnapshot {
            stage: InstallStage::Verify,
            artifact_id: Some(artifact.id.clone()),
            completed_bytes: completed,
            total_bytes: Some(artifact.size_bytes),
            manifest_verified: true,
            artifact_verified: false,
            service_state: None,
            migration_state: None,
            detail: Some("verifying exact size and SHA-256".into()),
        }, &now)?;
        let result = self.cache.finalize_staged_object(artifact)
            .map_err(|error| InstallerEngineError::Distribution(error.to_string()))?;
        self.boundary(JournalStage::Verify, true, true, false, Some(&artifact.id), &now)?;
        self.emit(ProgressSnapshot {
            stage: InstallStage::Verify,
            artifact_id: Some(artifact.id.clone()),
            completed_bytes: artifact.size_bytes,
            total_bytes: Some(artifact.size_bytes),
            manifest_verified: true,
            artifact_verified: true,
            service_state: None,
            migration_state: None,
            detail: Some("verified artifact activated in immutable cache".into()),
        }, &now)?;
        Ok(result)
    }

    /// Offline bytes travel through the exact same cache verification and journal
    /// boundaries as an online transfer.
    pub fn import_offline(
        &mut self,
        artifact: &ArtifactDescriptor,
        bytes: &[u8],
        now: impl Into<String>,
    ) -> Result<CacheImportResult, InstallerEngineError> {
        self.assert_product(artifact)?;
        let now = now.into();
        self.boundary(JournalStage::Download, false, true, false, Some(&artifact.id), &now)?;
        self.emit(ProgressSnapshot {
            stage: InstallStage::Download,
            artifact_id: Some(artifact.id.clone()),
            completed_bytes: bytes.len() as u64,
            total_bytes: Some(artifact.size_bytes),
            manifest_verified: true,
            artifact_verified: false,
            service_state: None,
            migration_state: None,
            detail: Some("importing offline package through verified cache".into()),
        }, &now)?;
        self.boundary(JournalStage::Verify, false, true, false, Some(&artifact.id), &now)?;
        let result = self.cache.import_verified_bytes(artifact, bytes)
            .map_err(|error| InstallerEngineError::Distribution(error.to_string()))?;
        self.boundary(JournalStage::Verify, true, true, false, Some(&artifact.id), &now)?;
        Ok(result)
    }

    pub fn run_platform<P: InstallationPlatform>(
        &mut self,
        platform: &mut P,
        artifact: &ArtifactDescriptor,
        now: impl Into<String>,
    ) -> Result<(), InstallerEngineError> {
        self.assert_product(artifact)?;
        let now = now.into();
        self.run_boundary(platform, JournalStage::Extract, Some(&artifact.id), &now, |platform| platform.extract(artifact))?;
        self.run_boundary(platform, JournalStage::ServiceRegistration, None, &now, |platform| platform.register_services())?;
        self.run_boundary(platform, JournalStage::FirstRun, None, &now, |platform| platform.run_first_start())?;
        self.run_boundary(platform, JournalStage::HealthCheck, None, &now, |platform| platform.health_check())?;
        self.boundary(JournalStage::Complete, true, false, false, None, &now)?;
        self.emit(ProgressSnapshot {
            stage: InstallStage::Complete,
            artifact_id: None,
            completed_bytes: 0,
            total_bytes: None,
            manifest_verified: true,
            artifact_verified: true,
            service_state: Some("healthy".into()),
            migration_state: Some("complete".into()),
            detail: Some("installation completed after health checks passed".into()),
        }, &now)?;
        Ok(())
    }

    fn run_boundary<P: InstallationPlatform>(
        &mut self,
        platform: &mut P,
        stage: JournalStage,
        artifact_id: Option<&str>,
        now: &str,
        operation: impl FnOnce(&mut P) -> Result<(), InstallerEngineError>,
    ) -> Result<(), InstallerEngineError> {
        self.boundary(stage, false, true, true, artifact_id, now)?;
        self.emit(ProgressSnapshot {
            stage: stage.into(),
            artifact_id: artifact_id.map(str::to_owned),
            completed_bytes: 0,
            total_bytes: None,
            manifest_verified: true,
            artifact_verified: true,
            service_state: if stage == JournalStage::ServiceRegistration { Some("registering".into()) } else { None },
            migration_state: if stage == JournalStage::FirstRun { Some("running".into()) } else { None },
            detail: None,
        }, now)?;
        if let Err(error) = operation(platform) {
            platform.rollback(stage)?;
            self.boundary(JournalStage::Rollback, true, false, false, artifact_id, now)?;
            return Err(error);
        }
        self.boundary(stage, true, true, true, artifact_id, now)
    }

    fn boundary(
        &mut self,
        stage: JournalStage,
        complete: bool,
        safe_to_resume: bool,
        safe_to_rollback: bool,
        artifact_id: Option<&str>,
        now: &str,
    ) -> Result<(), InstallerEngineError> {
        self.record.record_checkpoint(crate::StageCheckpoint {
            stage,
            complete,
            safe_to_resume,
            safe_to_rollback,
            recorded_at: now.into(),
            artifact_id: artifact_id.map(str::to_owned),
            detail: None,
        });
        self.journal.save(&self.record)?;
        Ok(())
    }

    fn emit(&mut self, snapshot: ProgressSnapshot, now: &str) -> Result<(), InstallerEngineError> {
        self.sequence = self.sequence.saturating_add(1);
        self.record.record_progress(snapshot.clone(), now);
        self.journal.save(&self.record)?;
        self.sink.emit(&InstallProgressEvent {
            installation_id: self.record.installation_id.clone(),
            sequence: self.sequence,
            snapshot,
        });
        Ok(())
    }

    fn assert_product(&self, artifact: &ArtifactDescriptor) -> Result<(), InstallerEngineError> {
        if artifact.product == self.record.product {
            Ok(())
        } else {
            Err(InstallerEngineError::InvalidProduct)
        }
    }
}

#[cfg(test)]
mod tests {
    use std::{
        env,
        io::{Cursor, Read},
        sync::{Arc, Mutex},
        time::{SystemTime, UNIX_EPOCH},
    };

    use semver::Version;

    use crate::{
        sha256_hex, ArtifactKind, Compatibility, InstallationJournal, ProductFlavor,
    };
    use super::{ArtifactRangeSource, InstallerEngine, InstallerEngineError, InstallerEventSink};

    struct Events(Arc<Mutex<Vec<crate::InstallProgressEvent>>>);
    impl InstallerEventSink for Events {
        fn emit(&self, event: &crate::InstallProgressEvent) {
            self.0.lock().unwrap().push(event.clone());
        }
    }

    struct Bytes(Vec<u8>);
    impl ArtifactRangeSource for Bytes {
        fn open_range(&mut self, _artifact: &crate::ArtifactDescriptor, offset: u64) -> Result<Box<dyn Read>, InstallerEngineError> {
            Ok(Box::new(Cursor::new(self.0[offset as usize..].to_vec())))
        }
    }

    fn root() -> std::path::PathBuf {
        let nonce = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
        env::temp_dir().join(format!("accore-installer-engine-{nonce}"))
    }

    fn artifact(bytes: &[u8]) -> crate::ArtifactDescriptor {
        crate::ArtifactDescriptor {
            id: "api-runtime".into(),
            kind: ArtifactKind::ApiRuntime,
            product: ProductFlavor::Server,
            version: Version::new(1, 0, 0),
            os: "linux".into(),
            architecture: "x86_64".into(),
            download_url: "https://releases.example.invalid/api-runtime".into(),
            sha256: sha256_hex(bytes),
            size_bytes: bytes.len() as u64,
            compatibility: Compatibility {
                minimum_bootstrapper_version: Version::new(1, 0, 0),
                minimum_os_version: None,
                required_features: Vec::new(),
            },
            dependencies: Vec::new(),
        }
    }

    #[test]
    fn online_and_offline_paths_share_verified_cache_activation() {
        let root = root();
        let bytes = b"verified artifact";
        let artifact = artifact(bytes);
        let events = Arc::new(Mutex::new(Vec::new()));
        let cache = crate::ArtifactCache::new(&root).unwrap();
        let journal = InstallationJournal::new(&root, "install-1").unwrap();
        let mut engine = InstallerEngine::open(cache, journal, "install-1", ProductFlavor::Server, "1.0.0", "now", Events(events.clone())).unwrap();
        let mut source = Bytes(bytes.to_vec());
        engine.download_and_verify(&mut source, &artifact, "now").unwrap();
        assert!(events.lock().unwrap().iter().any(|event| event.snapshot.artifact_verified));

        let cache = crate::ArtifactCache::new(&root).unwrap();
        let journal = InstallationJournal::new(&root, "install-2").unwrap();
        let mut offline = InstallerEngine::open(cache, journal, "install-2", ProductFlavor::Server, "1.0.0", "now", Events(events)).unwrap();
        assert!(offline.import_offline(&artifact, bytes, "now").is_ok());
        std::fs::remove_dir_all(root).unwrap();
    }
}
