use std::{
    collections::HashSet,
    fs::{self, File, OpenOptions},
    io::{Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
    thread,
    time::{Duration, Instant},
};

use serde::{Deserialize, Serialize};

use crate::{verify_sha256, ArtifactDescriptor, DistributionError, ProductFlavor};

const CACHE_SCHEMA_VERSION: u16 = 1;
const LOCK_WAIT: Duration = Duration::from_secs(30);
const LOCK_RETRY: Duration = Duration::from_millis(100);

/// Metadata retained next to an immutable cache object. It intentionally omits
/// source URLs, credentials, database locations, tokens, and customer data.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct CacheObject {
    pub schema_version: u16,
    pub sha256: String,
    pub size_bytes: u64,
    pub artifact_id: String,
    pub product: ProductFlavor,
    pub artifact_version: String,
    pub os: String,
    pub architecture: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct CacheReference {
    pub object_sha256: String,
    pub product: ProductFlavor,
    pub artifact_id: String,
    pub artifact_version: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CacheImportResult {
    Imported(CacheObject),
    Reused(CacheObject),
}

/// Shared cache for immutable, signed release dependencies.
///
/// `runtime_home` is normally `%ProgramData%/AccoreRuntime` on Windows. The cache
/// always lives under `<runtime_home>/cache`; database files, persistent ERP data,
/// and private configuration belong to other roots and cannot be addressed here.
#[derive(Debug, Clone)]
pub struct ArtifactCache {
    cache_root: PathBuf,
}

impl ArtifactCache {
    pub fn new(runtime_home: impl Into<PathBuf>) -> Result<Self, DistributionError> {
        let cache = Self {
            cache_root: runtime_home.into().join("cache"),
        };
        fs::create_dir_all(cache.objects_root())?;
        fs::create_dir_all(cache.staging_root())?;
        fs::create_dir_all(cache.locks_root())?;
        fs::create_dir_all(cache.references_root())?;
        Ok(cache)
    }

    pub fn cache_root(&self) -> &Path {
        &self.cache_root
    }

    /// Returns the immutable object path for a validated descriptor. No artifact
    /// identifier or user-supplied filename participates in this path.
    pub fn object_path(&self, sha256: &str) -> Result<PathBuf, DistributionError> {
        validate_digest(sha256)?;
        Ok(self.objects_root().join(sha256))
    }

    /// A resumable staging file. A downloader may inspect its length and request
    /// only missing bytes; staged bytes are never activated until full SHA-256
    /// verification succeeds in `finalize_staged_object`.
    pub fn staging_path(&self, sha256: &str) -> Result<PathBuf, DistributionError> {
        validate_digest(sha256)?;
        Ok(self.staging_root().join(format!("{sha256}.part")))
    }

    pub fn staged_offset(&self, sha256: &str) -> Result<u64, DistributionError> {
        let path = self.staging_path(sha256)?;
        Ok(fs::metadata(path)
            .map(|metadata| metadata.len())
            .unwrap_or(0))
    }

    /// Opens or creates a deterministic staging file and seeks to its current end.
    /// The caller must retain the cache object lock for the matching digest.
    pub fn open_staging_for_resume(&self, sha256: &str) -> Result<File, DistributionError> {
        let staging_path = self.staging_path(sha256)?;
        let mut file = OpenOptions::new()
            .create(true)
            .read(true)
            .append(true)
            .open(staging_path)?;
        file.seek(SeekFrom::End(0))?;
        Ok(file)
    }

    /// Imports externally downloaded package bytes into the same cache used by an
    /// online installer. The object is content-addressed and verified before the
    /// atomic move, so an altered offline package never reaches the object store.
    pub fn import_verified_bytes(
        &self,
        artifact: &ArtifactDescriptor,
        bytes: &[u8],
    ) -> Result<CacheImportResult, DistributionError> {
        self.ensure_cacheable(artifact)?;
        let _lock = self.acquire_lock(&artifact.sha256)?;
        if let Some(existing) = self.verified_object(artifact)? {
            self.write_reference(artifact)?;
            return Ok(CacheImportResult::Reused(existing));
        }

        let staging_path = self.staging_path(&artifact.sha256)?;
        write_atomic_bytes(&staging_path, bytes)?;
        self.finalize_staged_object_locked(artifact)
    }

    /// Finalizes a file written by a resumable downloader. It is safe to invoke
    /// repeatedly after an interruption: an existing verified object is reused.
    pub fn finalize_staged_object(
        &self,
        artifact: &ArtifactDescriptor,
    ) -> Result<CacheImportResult, DistributionError> {
        self.ensure_cacheable(artifact)?;
        let _lock = self.acquire_lock(&artifact.sha256)?;
        if let Some(existing) = self.verified_object(artifact)? {
            self.write_reference(artifact)?;
            return Ok(CacheImportResult::Reused(existing));
        }
        self.finalize_staged_object_locked(artifact)
    }

    /// Associates a verified immutable object with an installed product. References
    /// are separate from object metadata, allowing safe reuse across releases.
    pub fn write_reference(&self, artifact: &ArtifactDescriptor) -> Result<(), DistributionError> {
        self.ensure_cacheable(artifact)?;
        if self.verified_object(artifact)?.is_none() {
            return Err(DistributionError::ArtifactNotFound(artifact.id.clone()));
        }
        let reference = CacheReference {
            object_sha256: artifact.sha256.clone(),
            product: artifact.product,
            artifact_id: artifact.id.clone(),
            artifact_version: artifact.version.to_string(),
        };
        let reference_path = self.reference_path(artifact)?;
        write_atomic_bytes(
            &reference_path,
            &serde_json::to_vec_pretty(&reference)
                .map_err(|error| DistributionError::Serialization(error.to_string()))?,
        )
    }

    /// Removes only cache objects with no valid reference. This method never walks
    /// outside the content-addressed cache root and never touches ERP data roots.
    pub fn reclaim_unreferenced(&self) -> Result<Vec<String>, DistributionError> {
        let referenced = self.referenced_digests()?;
        let mut removed = Vec::new();
        for entry in fs::read_dir(self.objects_root())? {
            let entry = entry?;
            let file_type = entry.file_type()?;
            if !file_type.is_file() {
                continue;
            }
            let digest = entry.file_name().to_string_lossy().to_string();
            if validate_digest(&digest).is_err() || referenced.contains(&digest) {
                continue;
            }
            fs::remove_file(entry.path())?;
            let metadata_path = self.object_metadata_path(&digest)?;
            if metadata_path.exists() {
                fs::remove_file(metadata_path)?;
            }
            removed.push(digest);
        }
        removed.sort();
        Ok(removed)
    }

    fn finalize_staged_object_locked(
        &self,
        artifact: &ArtifactDescriptor,
    ) -> Result<CacheImportResult, DistributionError> {
        let staging_path = self.staging_path(&artifact.sha256)?;
        if !staging_path.exists() {
            return Err(DistributionError::ArtifactNotFound(format!(
                "staged object for {}",
                artifact.id
            )));
        }
        let bytes = read_file(&staging_path)?;
        if bytes.len() as u64 != artifact.size_bytes {
            return Err(DistributionError::InvalidManifest(format!(
                "artifact {} staged size does not match manifest",
                artifact.id
            )));
        }
        verify_sha256(&bytes, &artifact.sha256)?;

        let object_path = self.object_path(&artifact.sha256)?;
        move_atomically(&staging_path, &object_path)?;
        let object = CacheObject {
            schema_version: CACHE_SCHEMA_VERSION,
            sha256: artifact.sha256.clone(),
            size_bytes: artifact.size_bytes,
            artifact_id: artifact.id.clone(),
            product: artifact.product,
            artifact_version: artifact.version.to_string(),
            os: artifact.os.clone(),
            architecture: artifact.architecture.clone(),
        };
        write_atomic_bytes(
            &self.object_metadata_path(&artifact.sha256)?,
            &serde_json::to_vec_pretty(&object)
                .map_err(|error| DistributionError::Serialization(error.to_string()))?,
        )?;
        self.write_reference(artifact)?;
        Ok(CacheImportResult::Imported(object))
    }

    fn verified_object(
        &self,
        artifact: &ArtifactDescriptor,
    ) -> Result<Option<CacheObject>, DistributionError> {
        let object_path = self.object_path(&artifact.sha256)?;
        let metadata_path = self.object_metadata_path(&artifact.sha256)?;
        if !object_path.exists() || !metadata_path.exists() {
            return Ok(None);
        }
        let bytes = read_file(&object_path)?;
        if bytes.len() as u64 != artifact.size_bytes
            || verify_sha256(&bytes, &artifact.sha256).is_err()
        {
            return Ok(None);
        }
        let object = serde_json::from_slice::<CacheObject>(&read_file(&metadata_path)?)
            .map_err(|error| DistributionError::Serialization(error.to_string()))?;
        if object.schema_version != CACHE_SCHEMA_VERSION
            || object.sha256 != artifact.sha256
            || object.size_bytes != artifact.size_bytes
        {
            return Ok(None);
        }
        Ok(Some(object))
    }

    fn ensure_cacheable(&self, artifact: &ArtifactDescriptor) -> Result<(), DistributionError> {
        validate_digest(&artifact.sha256)?;
        if artifact.id.is_empty()
            || artifact.id.contains(['/', '\\'])
            || artifact.size_bytes == 0
            || artifact.download_url.contains('@')
        {
            return Err(DistributionError::CacheContainsProtectedData);
        }
        Ok(())
    }

    fn acquire_lock(&self, sha256: &str) -> Result<CacheLock, DistributionError> {
        let lock_path = self.locks_root().join(format!("{sha256}.lock"));
        let deadline = Instant::now() + LOCK_WAIT;
        loop {
            match OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(&lock_path)
            {
                Ok(file) => {
                    return Ok(CacheLock {
                        file,
                        path: lock_path,
                    })
                }
                Err(error)
                    if error.kind() == std::io::ErrorKind::AlreadyExists
                        && Instant::now() < deadline =>
                {
                    thread::sleep(LOCK_RETRY);
                }
                Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
                    return Err(DistributionError::Io(format!(
                        "timed out waiting for cache object lock: {}",
                        lock_path.display()
                    )));
                }
                Err(error) => return Err(error.into()),
            }
        }
    }

    fn referenced_digests(&self) -> Result<HashSet<String>, DistributionError> {
        let mut digests = HashSet::new();
        for entry in fs::read_dir(self.references_root())? {
            let entry = entry?;
            if !entry.file_type()?.is_file() {
                continue;
            }
            let reference = serde_json::from_slice::<CacheReference>(&read_file(&entry.path())?)
                .map_err(|error| DistributionError::Serialization(error.to_string()))?;
            if validate_digest(&reference.object_sha256).is_ok() {
                digests.insert(reference.object_sha256);
            }
        }
        Ok(digests)
    }

    fn objects_root(&self) -> PathBuf {
        self.cache_root.join("objects").join("sha256")
    }

    fn staging_root(&self) -> PathBuf {
        self.cache_root.join("staging")
    }

    fn locks_root(&self) -> PathBuf {
        self.cache_root.join("locks")
    }

    fn references_root(&self) -> PathBuf {
        self.cache_root.join("references")
    }

    fn object_metadata_path(&self, sha256: &str) -> Result<PathBuf, DistributionError> {
        Ok(self.object_path(sha256)?.with_extension("metadata.json"))
    }

    fn reference_path(&self, artifact: &ArtifactDescriptor) -> Result<PathBuf, DistributionError> {
        let name = format!(
            "{}--{}--{}.json",
            product_name(artifact.product),
            artifact.id,
            artifact.version
        );
        if name.contains(['/', '\\']) {
            return Err(DistributionError::CacheContainsProtectedData);
        }
        Ok(self.references_root().join(name))
    }
}

struct CacheLock {
    file: File,
    path: PathBuf,
}

impl Drop for CacheLock {
    fn drop(&mut self) {
        let _ = self.file.sync_all();
        let _ = fs::remove_file(&self.path);
    }
}

fn product_name(product: ProductFlavor) -> &'static str {
    match product {
        ProductFlavor::Server => "server",
        ProductFlavor::ServerHeadless => "server-headless",
        ProductFlavor::Client => "client",
    }
}

fn validate_digest(digest: &str) -> Result<(), DistributionError> {
    if digest.len() == 64
        && digest
            .bytes()
            .all(|byte| byte.is_ascii_digit() || matches!(byte, b'a'..=b'f'))
    {
        Ok(())
    } else {
        Err(DistributionError::InvalidManifest(
            "cache object digest must be a lowercase SHA-256 hex value".into(),
        ))
    }
}

fn read_file(path: &Path) -> Result<Vec<u8>, DistributionError> {
    let mut file = File::open(path)?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)?;
    Ok(bytes)
}

fn write_atomic_bytes(path: &Path, bytes: &[u8]) -> Result<(), DistributionError> {
    let parent = path
        .parent()
        .ok_or_else(|| DistributionError::Io("path has no parent directory".into()))?;
    fs::create_dir_all(parent)?;
    let temporary_path = path.with_extension(format!("tmp-{}", std::process::id()));
    {
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temporary_path)?;
        file.write_all(bytes)?;
        file.sync_all()?;
    }
    move_atomically(&temporary_path, path)
}

fn move_atomically(from: &Path, to: &Path) -> Result<(), DistributionError> {
    match fs::rename(from, to) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists && to.exists() => {
            fs::remove_file(from)?;
            Ok(())
        }
        Err(error) => Err(error.into()),
    }
}

#[cfg(test)]
mod tests {
    use std::{fs, thread};

    use semver::Version;

    use super::*;
    use crate::{sha256_hex, ArtifactKind, Compatibility};

    fn test_root(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "accore-distribution-cache-{name}-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        fs::create_dir_all(&path).unwrap();
        path
    }

    fn descriptor(id: &str, bytes: &[u8]) -> ArtifactDescriptor {
        ArtifactDescriptor {
            id: id.into(),
            kind: ArtifactKind::RuntimeDependency,
            product: ProductFlavor::Client,
            version: Version::parse("1.0.0").unwrap(),
            os: "windows".into(),
            architecture: "x86_64".into(),
            download_url: "https://downloads.accore.test/runtime.zip".into(),
            sha256: sha256_hex(bytes),
            size_bytes: bytes.len() as u64,
            compatibility: Compatibility {
                minimum_bootstrapper_version: Version::parse("1.0.0").unwrap(),
                minimum_os_version: None,
                required_features: vec![],
            },
            dependencies: vec![],
        }
    }

    #[test]
    fn server_headless_uses_a_distinct_cache_namespace() {
        assert_eq!(product_name(ProductFlavor::Server), "server");
        assert_eq!(product_name(ProductFlavor::ServerHeadless), "server-headless");
        assert_eq!(product_name(ProductFlavor::Client), "client");
    }

    #[test]
    fn verifies_before_import_and_reuses_matching_object() {
        let root = test_root("import");
        let cache = ArtifactCache::new(&root).unwrap();
        let bytes = b"verified runtime";
        let artifact = descriptor("runtime", bytes);

        assert!(matches!(
            cache.import_verified_bytes(&artifact, b"verified runtimE"),
            Err(DistributionError::DigestMismatch { .. })
        ));
        assert!(!cache.object_path(&artifact.sha256).unwrap().exists());

        assert!(matches!(
            cache.import_verified_bytes(&artifact, bytes).unwrap(),
            CacheImportResult::Imported(_)
        ));
        assert!(matches!(
            cache.import_verified_bytes(&artifact, bytes).unwrap(),
            CacheImportResult::Reused(_)
        ));
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn resumes_staged_download_then_verifies_before_activation() {
        let root = test_root("resume");
        let cache = ArtifactCache::new(&root).unwrap();
        let bytes = b"an offline package that can resume";
        let artifact = descriptor("offline-bundle", bytes);
        {
            let mut staged = cache.open_staging_for_resume(&artifact.sha256).unwrap();
            staged.write_all(&bytes[..10]).unwrap();
        }
        assert_eq!(cache.staged_offset(&artifact.sha256).unwrap(), 10);
        {
            let mut staged = cache.open_staging_for_resume(&artifact.sha256).unwrap();
            staged.write_all(&bytes[10..]).unwrap();
        }
        assert!(matches!(
            cache.finalize_staged_object(&artifact).unwrap(),
            CacheImportResult::Imported(_)
        ));
        assert!(cache.object_path(&artifact.sha256).unwrap().exists());
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn serializes_concurrent_imports_without_duplicate_corruption() {
        let root = test_root("concurrent");
        let cache = ArtifactCache::new(&root).unwrap();
        let bytes = b"shared immutable object".to_vec();
        let artifact = descriptor("runtime", &bytes);
        let left_cache = cache.clone();
        let left_artifact = artifact.clone();
        let left_bytes = bytes.clone();
        let right_cache = cache.clone();
        let right_artifact = artifact.clone();
        let right_bytes = bytes.clone();

        let left =
            thread::spawn(move || left_cache.import_verified_bytes(&left_artifact, &left_bytes));
        let right =
            thread::spawn(move || right_cache.import_verified_bytes(&right_artifact, &right_bytes));
        assert!(left.join().unwrap().is_ok());
        assert!(right.join().unwrap().is_ok());
        assert_eq!(
            read_file(&cache.object_path(&artifact.sha256).unwrap()).unwrap(),
            bytes
        );
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn reclaims_only_unreferenced_cache_objects() {
        let root = test_root("reclaim");
        let cache = ArtifactCache::new(&root).unwrap();
        let retained = descriptor("retained", b"retained");
        let removed = descriptor("removed", b"removed");
        cache.import_verified_bytes(&retained, b"retained").unwrap();
        cache.import_verified_bytes(&removed, b"removed").unwrap();
        let removed_reference = cache.reference_path(&removed).unwrap();
        fs::remove_file(removed_reference).unwrap();

        let removed_digest = removed.sha256.clone();
        let reclaimed = cache.reclaim_unreferenced().unwrap();
        assert_eq!(reclaimed, vec![removed_digest.clone()]);
        assert!(cache.object_path(&retained.sha256).unwrap().exists());
        assert!(!cache.object_path(&removed_digest).unwrap().exists());
        fs::remove_dir_all(root).unwrap();
    }
}
