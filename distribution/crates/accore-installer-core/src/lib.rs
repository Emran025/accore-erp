//! Trusted, resumable installation primitives shared by Accore setup surfaces.
//!
//! This crate never starts an ERP runtime, stores customer data, or handles private
//! release keys. It verifies immutable release artifacts, persists recovery state,
//! and reports redacted progress. Server Agent lifecycle control belongs to the
//! separate runtime-management boundary.

mod cache;
mod engine;
mod journal;
mod lifecycle;
mod manifest;
mod package;
mod progress;
mod release;
mod support;

pub use cache::{ArtifactCache, CacheImportResult, CacheObject};
pub use engine::{
    ArtifactRangeSource, InstallationPlatform, InstallerEngine, InstallerEngineError, InstallerEventSink,
};
pub use journal::{
    InstallationJournal, JournalError, JournalRecord, JournalStage, RecoveryAction,
    StageCheckpoint,
};
pub use lifecycle::{
    CustomerDataDisposition, MaintenanceOperation, MaintenancePlan,
    NonInteractiveAdministration, SecretInput,
};
pub use package::AccorePackage;
pub use manifest::{
    sha256_hex, verify_sha256, ArtifactDescriptor, ArtifactKind, Compatibility, DistributionError,
    ProductFlavor, ReleaseManifest, TrustedReleaseKey,
};
pub use progress::{
    InstallProgressEvent, InstallStage, InstallerProgressReporter, ProgressSnapshot,
};
pub use release::{
    ReleaseLedger, ReleaseLedgerEntry, ServerReleaseError, ServerReleasePlan,
    ServerReleasePlatform, ServerReleaseState, ServerReleaseTransaction,
};
pub use support::{
    redact_diagnostic_text, write_redacted_support_bundle, SupportBundleError, SupportBundleInput,
};
