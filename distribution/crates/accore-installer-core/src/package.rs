use std::{
    collections::{BTreeMap, BTreeSet},
    io::{Cursor, Read, Write},
};

use zip::{write::FileOptions, ZipArchive, ZipWriter};

use crate::{
    verify_sha256, ArtifactDescriptor, DistributionError, ReleaseManifest, TrustedReleaseKey,
};

const MANIFEST_ENTRY: &str = "release-manifest.json";
const ARTIFACT_PREFIX: &str = "artifacts/";
const MAX_MANIFEST_BYTES: u64 = 1024 * 1024;

/// Portable, signed delivery container. The `.accorepkg` extension always maps to
/// this ZIP layout: one signed manifest and one immutable byte stream per descriptor.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AccorePackage {
    pub manifest: ReleaseManifest,
    pub artifacts: BTreeMap<String, Vec<u8>>,
}

impl AccorePackage {
    /// Build a deterministic package layout after validating every declared artifact.
    ///
    /// The caller must sign the manifest before packaging it. Consumers must use
    /// [`Self::parse_and_verify`] with bootstrapper-pinned keys before activation.
    pub fn build(
        manifest: ReleaseManifest,
        artifacts: BTreeMap<String, Vec<u8>>,
    ) -> Result<Vec<u8>, DistributionError> {
        Self::validate_artifacts(&manifest, &artifacts)?;
        if manifest.signature.key_id.is_empty() || manifest.signature.ed25519.is_empty() {
            return Err(DistributionError::InvalidManifest(
                "accorepkg manifest must include a release signature".into(),
            ));
        }

        let mut writer = ZipWriter::new(Cursor::new(Vec::new()));
        let options = FileOptions::default()
            .last_modified_time(zip::DateTime::default())
            .compression_method(zip::CompressionMethod::Deflated);
        writer.start_file(MANIFEST_ENTRY, options).map_err(zip_error)?;
        writer.write_all(
            &serde_json::to_vec(&manifest)
                .map_err(|error| DistributionError::Serialization(error.to_string()))?,
        )?;

        for (id, bytes) in &artifacts {
            writer
                .start_file(format!("{ARTIFACT_PREFIX}{id}"), options)
                .map_err(zip_error)?;
            writer.write_all(bytes)?;
        }

        writer
            .finish()
            .map_err(zip_error)
            .map(|cursor| cursor.into_inner())
    }

    /// Parse an untrusted ZIP payload, verify the signed manifest against the trusted
    /// release keys, and verify every extracted artifact against its signed digest.
    pub fn parse_and_verify(
        bytes: &[u8],
        trusted_keys: &[TrustedReleaseKey],
    ) -> Result<Self, DistributionError> {
        let mut archive = ZipArchive::new(Cursor::new(bytes)).map_err(zip_error)?;
        let manifest_bytes = read_unique_manifest(&mut archive)?;
        let manifest = ReleaseManifest::parse_and_verify(&manifest_bytes, trusted_keys)?;
        let expected_entries = expected_entries(&manifest);
        validate_archive_layout(&mut archive, &expected_entries)?;

        let mut artifacts = BTreeMap::new();
        for descriptor in &manifest.artifacts {
            let entry_name = format!("{ARTIFACT_PREFIX}{}", descriptor.id);
            let mut artifact_file = archive
                .by_name(&entry_name)
                .map_err(|_| DistributionError::ArtifactNotFound(descriptor.id.clone()))?;

            if artifact_file.size() != descriptor.size_bytes {
                return Err(DistributionError::InvalidManifest(format!(
                    "artifact {} size does not match descriptor",
                    descriptor.id
                )));
            }

            let mut artifact = Vec::new();
            artifact_file.read_to_end(&mut artifact)?;
            validate_artifact_bytes(descriptor, &artifact)?;
            artifacts.insert(descriptor.id.clone(), artifact);
        }

        Ok(Self {
            manifest,
            artifacts,
        })
    }

    fn validate_artifacts(
        manifest: &ReleaseManifest,
        artifacts: &BTreeMap<String, Vec<u8>>,
    ) -> Result<(), DistributionError> {
        manifest.validate()?;
        if artifacts.len() != manifest.artifacts.len() {
            return Err(DistributionError::InvalidManifest(
                "accorepkg artifact count does not match manifest".into(),
            ));
        }

        for descriptor in &manifest.artifacts {
            let bytes = artifacts
                .get(&descriptor.id)
                .ok_or_else(|| DistributionError::ArtifactNotFound(descriptor.id.clone()))?;
            validate_artifact_bytes(descriptor, bytes)?;
        }

        Ok(())
    }
}

fn read_unique_manifest(
    archive: &mut ZipArchive<Cursor<&[u8]>>,
) -> Result<Vec<u8>, DistributionError> {
    let mut manifest_count = 0;
    for index in 0..archive.len() {
        let entry = archive.by_index(index).map_err(zip_error)?;
        if !entry.is_dir() && entry.name() == MANIFEST_ENTRY {
            manifest_count += 1;
        }
    }
    if manifest_count != 1 {
        return Err(DistributionError::InvalidManifest(
            "accorepkg must contain exactly one release manifest".into(),
        ));
    }

    let mut manifest_file = archive.by_name(MANIFEST_ENTRY).map_err(zip_error)?;
    if manifest_file.size() > MAX_MANIFEST_BYTES {
        return Err(DistributionError::InvalidManifest(
            "accorepkg manifest exceeds the maximum supported size".into(),
        ));
    }

    let mut manifest_bytes = Vec::new();
    manifest_file.read_to_end(&mut manifest_bytes)?;
    Ok(manifest_bytes)
}

fn expected_entries(manifest: &ReleaseManifest) -> BTreeSet<String> {
    manifest
        .artifacts
        .iter()
        .map(|artifact| format!("{ARTIFACT_PREFIX}{}", artifact.id))
        .chain(std::iter::once(MANIFEST_ENTRY.to_string()))
        .collect()
}

fn validate_archive_layout(
    archive: &mut ZipArchive<Cursor<&[u8]>>,
    expected_entries: &BTreeSet<String>,
) -> Result<(), DistributionError> {
    let mut observed_entries = BTreeSet::new();
    for index in 0..archive.len() {
        let entry = archive.by_index(index).map_err(zip_error)?;
        let name = entry.name();
        if entry.is_dir() || !expected_entries.contains(name) {
            return Err(DistributionError::InvalidManifest(format!(
                "accorepkg contains undeclared entry {name}"
            )));
        }
        if !observed_entries.insert(name.to_string()) {
            return Err(DistributionError::InvalidManifest(format!(
                "accorepkg contains duplicate entry {name}"
            )));
        }
    }

    if &observed_entries != expected_entries {
        return Err(DistributionError::InvalidManifest(
            "accorepkg layout does not match its manifest".into(),
        ));
    }
    Ok(())
}

fn validate_artifact_bytes(
    descriptor: &ArtifactDescriptor,
    bytes: &[u8],
) -> Result<(), DistributionError> {
    verify_sha256(bytes, &descriptor.sha256)?;
    if bytes.len() as u64 != descriptor.size_bytes {
        return Err(DistributionError::InvalidManifest(format!(
            "artifact {} size does not match descriptor",
            descriptor.id
        )));
    }
    Ok(())
}

fn zip_error(error: zip::result::ZipError) -> DistributionError {
    DistributionError::Io(error.to_string())
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
    use ed25519_dalek::{Signer, SigningKey};
    use semver::Version;
    use zip::{write::FileOptions, ZipWriter};

    use super::*;
    use crate::{sha256_hex, ArtifactKind, Compatibility, ProductFlavor};
    use crate::manifest::ManifestSignature;

    fn signed_manifest(payload: &[u8]) -> (ReleaseManifest, TrustedReleaseKey) {
        let mut manifest = ReleaseManifest {
            schema_version: 1,
            channel: "stable".into(),
            product: ProductFlavor::Client,
            release_version: Version::parse("1.2.3").unwrap(),
            generated_at: "2026-08-18T00:00:00Z".into(),
            source_revision: "8ddbe38".into(),
            artifacts: vec![ArtifactDescriptor {
                id: "client-app".into(),
                kind: ArtifactKind::DesktopApplication,
                product: ProductFlavor::Client,
                version: Version::parse("1.2.3").unwrap(),
                os: "windows".into(),
                architecture: "x86_64".into(),
                download_url: "https://downloads.accore.test/client-app.zip".into(),
                sha256: sha256_hex(payload),
                size_bytes: payload.len() as u64,
                compatibility: Compatibility {
                    minimum_bootstrapper_version: Version::parse("1.0.0").unwrap(),
                    minimum_os_version: None,
                    required_features: vec![],
                },
                dependencies: vec![],
            }],
            signature: ManifestSignature {
                key_id: "release-key-1".into(),
                ed25519: String::new(),
            },
        };
        let signing_key = SigningKey::from_bytes(&[7; 32]);
        let signature = signing_key.sign(&manifest.canonical_unsigned_payload().unwrap());
        manifest.signature.ed25519 = BASE64.encode(signature.to_bytes());
        let trusted_key = TrustedReleaseKey {
            key_id: manifest.signature.key_id.clone(),
            ed25519_public_key: BASE64.encode(signing_key.verifying_key().to_bytes()),
        };
        (manifest, trusted_key)
    }

    fn raw_package(manifest: &ReleaseManifest, entries: &[(&str, &[u8])]) -> Vec<u8> {
        let mut writer = ZipWriter::new(Cursor::new(Vec::new()));
        let options = FileOptions::default().compression_method(zip::CompressionMethod::Deflated);
        writer.start_file(MANIFEST_ENTRY, options).unwrap();
        writer.write_all(&serde_json::to_vec(manifest).unwrap()).unwrap();
        for (name, bytes) in entries {
            writer.start_file(*name, options).unwrap();
            writer.write_all(bytes).unwrap();
        }
        writer.finish().unwrap().into_inner()
    }

    #[test]
    fn builds_and_verifies_a_signed_package() {
        let artifact = b"desktop payload".to_vec();
        let (manifest, trusted_key) = signed_manifest(&artifact);
        let artifacts = BTreeMap::from([("client-app".into(), artifact.clone())]);

        let package = AccorePackage::build(manifest.clone(), artifacts).unwrap();
        let parsed = AccorePackage::parse_and_verify(&package, &[trusted_key]).unwrap();

        assert_eq!(parsed.manifest, manifest);
        assert_eq!(parsed.artifacts.get("client-app"), Some(&artifact));
    }

    #[test]
    fn rejects_unsigned_manifests_at_build_time() {
        let artifact = b"desktop payload".to_vec();
        let (mut manifest, _) = signed_manifest(&artifact);
        manifest.signature.ed25519.clear();
        let artifacts = BTreeMap::from([("client-app".into(), artifact)]);

        assert!(matches!(
            AccorePackage::build(manifest, artifacts),
            Err(DistributionError::InvalidManifest(message)) if message.contains("release signature")
        ));
    }

    #[test]
    fn rejects_manifest_modified_after_signing() {
        let artifact = b"desktop payload".to_vec();
        let (mut manifest, trusted_key) = signed_manifest(&artifact);
        manifest.release_version = Version::parse("9.9.9").unwrap();
        let package = raw_package(
            &manifest,
            &[("artifacts/client-app", artifact.as_slice())],
        );

        assert_eq!(
            AccorePackage::parse_and_verify(&package, &[trusted_key]),
            Err(DistributionError::SignatureVerificationFailed)
        );
    }

    #[test]
    fn rejects_artifact_modified_after_packaging() {
        let artifact = b"desktop payload".to_vec();
        let (manifest, trusted_key) = signed_manifest(&artifact);
        let package = raw_package(&manifest, &[("artifacts/client-app", b"tampered")]);

        assert!(matches!(
            AccorePackage::parse_and_verify(&package, &[trusted_key]),
            Err(DistributionError::InvalidManifest(message)) if message.contains("size does not match")
        ));
    }

    #[test]
    fn rejects_undeclared_archive_entries() {
        let artifact = b"desktop payload".to_vec();
        let (manifest, trusted_key) = signed_manifest(&artifact);
        let package = raw_package(
            &manifest,
            &[
                ("artifacts/client-app", artifact.as_slice()),
                ("untrusted-debug.log", b"unexpected"),
            ],
        );

        assert!(matches!(
            AccorePackage::parse_and_verify(&package, &[trusted_key]),
            Err(DistributionError::InvalidManifest(message)) if message.contains("undeclared entry")
        ));
    }
}
