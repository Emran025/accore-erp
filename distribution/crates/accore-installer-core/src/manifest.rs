use std::{
    collections::{BTreeMap, BTreeSet, HashSet},
    fmt,
};

use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use semver::Version;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

const MANIFEST_SCHEMA_VERSION: u16 = 1;
const SHA256_HEX_LENGTH: usize = 64;

/// The product a release artifact can serve. A Server release may contain desktop
/// and runtime artifacts, while a Client release must never contain database data.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ProductFlavor {
    Server,
    Client,
}

/// Logical artifact categories used by the bootstrapper and release policy.
#[derive(Debug, Clone, Copy, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ArtifactKind {
    Bootstrapper,
    DesktopApplication,
    ServerAgent,
    ApiRuntime,
    DatabaseRuntime,
    MigrationBundle,
    RuntimeDependency,
    OfflineBundle,
}

/// Compatibility constraints which must be checked before an artifact is activated.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct Compatibility {
    pub minimum_bootstrapper_version: Version,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub minimum_os_version: Option<String>,
    #[serde(default)]
    pub required_features: Vec<String>,
}

/// Immutable metadata for a content-addressed release object.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct ArtifactDescriptor {
    /// Stable identifier, sorted lexicographically in a manifest.
    pub id: String,
    pub kind: ArtifactKind,
    pub product: ProductFlavor,
    pub version: Version,
    pub os: String,
    pub architecture: String,
    /// HTTPS source used by an online bootstrapper. Offline imports validate the
    /// same descriptor but do not fetch this location.
    pub download_url: String,
    /// Lowercase SHA-256 digest of the exact stored bytes.
    pub sha256: String,
    pub size_bytes: u64,
    pub compatibility: Compatibility,
    #[serde(default)]
    pub dependencies: Vec<String>,
}

/// Detached signing information attached after canonical manifest serialization.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct ManifestSignature {
    pub key_id: String,
    /// Standard Base64-encoded Ed25519 signature over the canonical unsigned manifest.
    pub ed25519: String,
}

/// The signed, versioned release contract consumed by online and offline installers.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct ReleaseManifest {
    pub schema_version: u16,
    pub channel: String,
    pub product: ProductFlavor,
    pub release_version: Version,
    /// ISO-8601 timestamp supplied by release automation. It is retained for audit,
    /// while signature and compatibility are the activation authorities.
    pub generated_at: String,
    /// Immutable source revision used to produce the release.
    pub source_revision: String,
    pub artifacts: Vec<ArtifactDescriptor>,
    pub signature: ManifestSignature,
}

/// A release public key included by the trusted bootstrapper configuration.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct TrustedReleaseKey {
    pub key_id: String,
    /// Standard Base64-encoded Ed25519 public key (32 bytes).
    pub ed25519_public_key: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DistributionError {
    InvalidManifest(String),
    UnsupportedSchema(u16),
    UnknownSigningKey(String),
    InvalidPublicKey(String),
    InvalidSignatureEncoding,
    SignatureVerificationFailed,
    DigestMismatch { expected: String, actual: String },
    ArtifactNotFound(String),
    CacheContainsProtectedData,
    Io(String),
    Serialization(String),
}

impl fmt::Display for DistributionError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidManifest(message) => {
                write!(formatter, "invalid release manifest: {message}")
            }
            Self::UnsupportedSchema(version) => {
                write!(formatter, "unsupported manifest schema version: {version}")
            }
            Self::UnknownSigningKey(key_id) => write!(
                formatter,
                "manifest references unknown signing key: {key_id}"
            ),
            Self::InvalidPublicKey(key_id) => write!(
                formatter,
                "trusted key {key_id} is not a valid Ed25519 public key"
            ),
            Self::InvalidSignatureEncoding => write!(
                formatter,
                "manifest signature is not valid Base64 Ed25519 data"
            ),
            Self::SignatureVerificationFailed => {
                write!(formatter, "manifest signature verification failed")
            }
            Self::DigestMismatch { expected, actual } => write!(
                formatter,
                "artifact digest mismatch: expected {expected}, received {actual}"
            ),
            Self::ArtifactNotFound(id) => {
                write!(formatter, "manifest artifact was not found: {id}")
            }
            Self::CacheContainsProtectedData => write!(
                formatter,
                "cache objects must not contain customer data, secrets, or ERP business data"
            ),
            Self::Io(message) => write!(formatter, "distribution I/O error: {message}"),
            Self::Serialization(message) => {
                write!(formatter, "manifest serialization error: {message}")
            }
        }
    }
}

impl std::error::Error for DistributionError {}

impl From<std::io::Error> for DistributionError {
    fn from(error: std::io::Error) -> Self {
        Self::Io(error.to_string())
    }
}

#[derive(Serialize)]
struct UnsignedManifest<'a> {
    schema_version: u16,
    channel: &'a str,
    product: ProductFlavor,
    release_version: &'a Version,
    generated_at: &'a str,
    source_revision: &'a str,
    artifacts: &'a [ArtifactDescriptor],
}

impl ReleaseManifest {
    /// Parse untrusted manifest bytes, validate all structural constraints, and
    /// verify their Ed25519 signature before returning a usable release contract.
    pub fn parse_and_verify(
        bytes: &[u8],
        trusted_keys: &[TrustedReleaseKey],
    ) -> Result<Self, DistributionError> {
        let manifest: Self = serde_json::from_slice(bytes)
            .map_err(|error| DistributionError::InvalidManifest(error.to_string()))?;
        manifest.validate()?;
        manifest.verify_signature(trusted_keys)?;
        Ok(manifest)
    }

    /// Verifies the entire immutable contract before individual artifacts are
    /// downloaded, imported, extracted, or activated.
    pub fn validate(&self) -> Result<(), DistributionError> {
        if self.schema_version != MANIFEST_SCHEMA_VERSION {
            return Err(DistributionError::UnsupportedSchema(self.schema_version));
        }
        validate_token("channel", &self.channel)?;
        validate_source_revision(&self.source_revision)?;
        if self.generated_at.trim().is_empty() {
            return Err(DistributionError::InvalidManifest(
                "generated_at must not be empty".into(),
            ));
        }
        if self.artifacts.is_empty() {
            return Err(DistributionError::InvalidManifest(
                "at least one artifact is required".into(),
            ));
        }

        let mut ids = BTreeSet::new();
        let mut previous_id: Option<&str> = None;
        for artifact in &self.artifacts {
            validate_artifact(artifact, self.product)?;
            if let Some(previous) = previous_id {
                if previous >= artifact.id.as_str() {
                    return Err(DistributionError::InvalidManifest(
                        "artifacts must be strictly sorted by id for canonical review".into(),
                    ));
                }
            }
            previous_id = Some(&artifact.id);
            if !ids.insert(artifact.id.as_str()) {
                return Err(DistributionError::InvalidManifest(format!(
                    "duplicate artifact id: {}",
                    artifact.id
                )));
            }
        }

        validate_dependency_graph(&self.artifacts, &ids)?;
        Ok(())
    }

    /// Return deterministic bytes for signing. The signature itself is excluded
    /// and no map-based fields are used, so serde preserves the declared order.
    pub fn canonical_unsigned_payload(&self) -> Result<Vec<u8>, DistributionError> {
        serde_json::to_vec(&UnsignedManifest {
            schema_version: self.schema_version,
            channel: &self.channel,
            product: self.product,
            release_version: &self.release_version,
            generated_at: &self.generated_at,
            source_revision: &self.source_revision,
            artifacts: &self.artifacts,
        })
        .map_err(|error| DistributionError::Serialization(error.to_string()))
    }

    pub fn verify_signature(
        &self,
        trusted_keys: &[TrustedReleaseKey],
    ) -> Result<(), DistributionError> {
        let trusted_key = trusted_keys
            .iter()
            .find(|key| key.key_id == self.signature.key_id)
            .ok_or_else(|| DistributionError::UnknownSigningKey(self.signature.key_id.clone()))?;
        let public_key_bytes = BASE64
            .decode(trusted_key.ed25519_public_key.as_bytes())
            .map_err(|_| DistributionError::InvalidPublicKey(trusted_key.key_id.clone()))?;
        let public_key: [u8; 32] = public_key_bytes
            .try_into()
            .map_err(|_| DistributionError::InvalidPublicKey(trusted_key.key_id.clone()))?;
        let verifying_key = VerifyingKey::from_bytes(&public_key)
            .map_err(|_| DistributionError::InvalidPublicKey(trusted_key.key_id.clone()))?;
        let signature_bytes = BASE64
            .decode(self.signature.ed25519.as_bytes())
            .map_err(|_| DistributionError::InvalidSignatureEncoding)?;
        let signature = Signature::from_slice(&signature_bytes)
            .map_err(|_| DistributionError::InvalidSignatureEncoding)?;

        verifying_key
            .verify(&self.canonical_unsigned_payload()?, &signature)
            .map_err(|_| DistributionError::SignatureVerificationFailed)
    }

    pub fn artifact(&self, id: &str) -> Result<&ArtifactDescriptor, DistributionError> {
        self.artifacts
            .iter()
            .find(|artifact| artifact.id == id)
            .ok_or_else(|| DistributionError::ArtifactNotFound(id.into()))
    }
}

pub fn sha256_hex(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}

pub fn verify_sha256(bytes: &[u8], expected: &str) -> Result<(), DistributionError> {
    let actual = sha256_hex(bytes);
    if actual == expected {
        Ok(())
    } else {
        Err(DistributionError::DigestMismatch {
            expected: expected.into(),
            actual,
        })
    }
}

fn validate_artifact(
    artifact: &ArtifactDescriptor,
    product: ProductFlavor,
) -> Result<(), DistributionError> {
    validate_token("artifact id", &artifact.id)?;
    validate_token("artifact os", &artifact.os)?;
    validate_token("artifact architecture", &artifact.architecture)?;
    if artifact.product != product {
        return Err(DistributionError::InvalidManifest(format!(
            "artifact {} product does not match manifest product",
            artifact.id
        )));
    }
    if product == ProductFlavor::Client
        && matches!(
            artifact.kind,
            ArtifactKind::ServerAgent
                | ArtifactKind::ApiRuntime
                | ArtifactKind::DatabaseRuntime
                | ArtifactKind::MigrationBundle
        )
    {
        return Err(DistributionError::InvalidManifest(format!(
            "client artifact {} cannot contain a server runtime component",
            artifact.id
        )));
    }
    if artifact.size_bytes == 0 {
        return Err(DistributionError::InvalidManifest(format!(
            "artifact {} must declare a non-zero size",
            artifact.id
        )));
    }
    if artifact.sha256.len() != SHA256_HEX_LENGTH
        || !artifact
            .sha256
            .bytes()
            .all(|byte| byte.is_ascii_digit() || matches!(byte, b'a'..=b'f'))
    {
        return Err(DistributionError::InvalidManifest(format!(
            "artifact {} sha256 must be a lowercase 64-character hexadecimal digest",
            artifact.id
        )));
    }
    if !artifact.download_url.starts_with("https://") {
        return Err(DistributionError::InvalidManifest(format!(
            "artifact {} download_url must use HTTPS",
            artifact.id
        )));
    }
    if artifact
        .compatibility
        .minimum_os_version
        .as_deref()
        .is_some_and(str::is_empty)
    {
        return Err(DistributionError::InvalidManifest(format!(
            "artifact {} minimum_os_version must be omitted or non-empty",
            artifact.id
        )));
    }
    for feature in &artifact.compatibility.required_features {
        validate_token("required feature", feature)?;
    }
    Ok(())
}

fn validate_dependency_graph(
    artifacts: &[ArtifactDescriptor],
    ids: &BTreeSet<&str>,
) -> Result<(), DistributionError> {
    let by_id: BTreeMap<&str, &ArtifactDescriptor> = artifacts
        .iter()
        .map(|artifact| (artifact.id.as_str(), artifact))
        .collect();

    for artifact in artifacts {
        let mut dependencies = HashSet::new();
        for dependency in &artifact.dependencies {
            if dependency == &artifact.id {
                return Err(DistributionError::InvalidManifest(format!(
                    "artifact {} cannot depend on itself",
                    artifact.id
                )));
            }
            if !ids.contains(dependency.as_str()) {
                return Err(DistributionError::InvalidManifest(format!(
                    "artifact {} references unknown dependency {}",
                    artifact.id, dependency
                )));
            }
            if !dependencies.insert(dependency.as_str()) {
                return Err(DistributionError::InvalidManifest(format!(
                    "artifact {} lists dependency {} more than once",
                    artifact.id, dependency
                )));
            }
        }
    }

    fn visit<'a>(
        id: &'a str,
        by_id: &BTreeMap<&'a str, &'a ArtifactDescriptor>,
        visiting: &mut HashSet<&'a str>,
        visited: &mut HashSet<&'a str>,
    ) -> Result<(), DistributionError> {
        if visited.contains(id) {
            return Ok(());
        }
        if !visiting.insert(id) {
            return Err(DistributionError::InvalidManifest(format!(
                "artifact dependency cycle includes {id}"
            )));
        }
        for dependency in &by_id[id].dependencies {
            visit(dependency, by_id, visiting, visited)?;
        }
        visiting.remove(id);
        visited.insert(id);
        Ok(())
    }

    let mut visiting = HashSet::new();
    let mut visited = HashSet::new();
    for id in by_id.keys() {
        visit(id, &by_id, &mut visiting, &mut visited)?;
    }
    Ok(())
}

fn validate_token(field: &str, token: &str) -> Result<(), DistributionError> {
    if token.is_empty()
        || token.len() > 128
        || !token.bytes().all(|byte| {
            byte.is_ascii_lowercase() || byte.is_ascii_digit() || matches!(byte, b'-' | b'_' | b'.')
        })
    {
        return Err(DistributionError::InvalidManifest(format!(
            "{field} must be 1-128 lowercase token characters",
        )));
    }
    Ok(())
}

fn validate_source_revision(revision: &str) -> Result<(), DistributionError> {
    let valid_length = (7..=64).contains(&revision.len());
    let valid_hex = revision.bytes().all(|byte| byte.is_ascii_hexdigit());
    if valid_length && valid_hex {
        Ok(())
    } else {
        Err(DistributionError::InvalidManifest(
            "source_revision must be a 7-64 character hexadecimal revision".into(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use ed25519_dalek::{Signer, SigningKey};

    use super::*;

    fn descriptor(id: &str, dependencies: Vec<&str>) -> ArtifactDescriptor {
        ArtifactDescriptor {
            id: id.into(),
            kind: ArtifactKind::RuntimeDependency,
            product: ProductFlavor::Client,
            version: Version::parse("1.0.0").unwrap(),
            os: "windows".into(),
            architecture: "x86_64".into(),
            download_url: format!("https://downloads.accore.test/{id}.zip"),
            sha256: sha256_hex(id.as_bytes()),
            size_bytes: 1024,
            compatibility: Compatibility {
                minimum_bootstrapper_version: Version::parse("1.0.0").unwrap(),
                minimum_os_version: None,
                required_features: vec![],
            },
            dependencies: dependencies.into_iter().map(str::to_owned).collect(),
        }
    }

    fn unsigned_manifest() -> ReleaseManifest {
        ReleaseManifest {
            schema_version: MANIFEST_SCHEMA_VERSION,
            channel: "stable".into(),
            product: ProductFlavor::Client,
            release_version: Version::parse("1.2.3").unwrap(),
            generated_at: "2026-08-18T00:00:00Z".into(),
            source_revision: "8ddbe38".into(),
            artifacts: vec![
                descriptor("app", vec!["runtime"]),
                descriptor("runtime", vec![]),
            ],
            signature: ManifestSignature {
                key_id: "release-key-1".into(),
                ed25519: String::new(),
            },
        }
    }

    fn sign(mut manifest: ReleaseManifest) -> (ReleaseManifest, TrustedReleaseKey) {
        let signing_key = SigningKey::from_bytes(&[7; 32]);
        let signature = signing_key.sign(&manifest.canonical_unsigned_payload().unwrap());
        manifest.signature.ed25519 = BASE64.encode(signature.to_bytes());
        let trusted_key = TrustedReleaseKey {
            key_id: manifest.signature.key_id.clone(),
            ed25519_public_key: BASE64.encode(signing_key.verifying_key().to_bytes()),
        };
        (manifest, trusted_key)
    }

    #[test]
    fn accepts_a_valid_signed_manifest() {
        let (manifest, trusted_key) = sign(unsigned_manifest());
        let bytes = serde_json::to_vec(&manifest).unwrap();
        let parsed = ReleaseManifest::parse_and_verify(&bytes, &[trusted_key]).unwrap();
        assert_eq!(
            parsed.artifact("app").unwrap().dependencies,
            vec!["runtime"]
        );
    }

    #[test]
    fn rejects_tampered_signed_manifest() {
        let (mut manifest, trusted_key) = sign(unsigned_manifest());
        manifest.release_version = Version::parse("9.9.9").unwrap();
        assert_eq!(
            manifest.verify_signature(&[trusted_key]),
            Err(DistributionError::SignatureVerificationFailed)
        );
    }

    #[test]
    fn rejects_unsorted_or_cyclic_dependencies() {
        let mut manifest = unsigned_manifest();
        manifest.artifacts.reverse();
        assert!(matches!(
            manifest.validate(),
            Err(DistributionError::InvalidManifest(_))
        ));

        let mut manifest = unsigned_manifest();
        manifest.artifacts[1].dependencies = vec!["app".into()];
        assert!(matches!(
            manifest.validate(),
            Err(DistributionError::InvalidManifest(_))
        ));
    }

    #[test]
    fn rejects_server_runtime_components_in_client_manifest() {
        let mut manifest = unsigned_manifest();
        for kind in [
            ArtifactKind::ServerAgent,
            ArtifactKind::ApiRuntime,
            ArtifactKind::DatabaseRuntime,
            ArtifactKind::MigrationBundle,
        ] {
            manifest.artifacts[0].kind = kind;
            assert!(matches!(
                manifest.validate(),
                Err(DistributionError::InvalidManifest(message)) if message.contains("server runtime component")
            ));
        }
    }

    #[test]
    fn detects_digest_mismatch() {
        let expected = sha256_hex(b"expected");
        assert!(verify_sha256(b"received", &expected).is_err());
        assert!(verify_sha256(b"expected", &expected).is_ok());
    }
}
