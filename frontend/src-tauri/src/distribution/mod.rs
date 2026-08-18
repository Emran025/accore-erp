//! Distribution primitives for self-contained Accore Server and Client releases.
//!
//! This module intentionally owns only immutable release artifacts. Customer data,
//! runtime secrets, API tokens, and database files are never valid cache objects.

mod artifact_contract;
mod cache;

pub use artifact_contract::{
    sha256_hex, verify_sha256, ArtifactDescriptor, ArtifactKind, Compatibility, DistributionError,
    ProductFlavor, ReleaseManifest, TrustedReleaseKey,
};
pub use cache::{ArtifactCache, CacheImportResult, CacheObject};
