use std::{collections::BTreeSet, fmt, path::PathBuf};

pub const REQUIRED_EXTENSIONS: &[&str] = &["pdo_mysql", "mbstring", "dom", "fileinfo", "intl", "bcmath", "curl", "zip", "xml"];
pub const ALLOWED_ARTISAN: &[&str] = &["config:cache", "migrate", "migrate:status", "queue:restart", "storage:link"];

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ApiRuntimeLayout { pub runtime_root: PathBuf, pub storage_root: PathBuf, pub logs_root: PathBuf, pub uploads_root: PathBuf, pub sessions_root: PathBuf, pub cache_root: PathBuf }
impl ApiRuntimeLayout {
    pub fn machine_scoped(runtime_home: impl Into<PathBuf>, data_home: impl Into<PathBuf>) -> Self { let runtime_root = runtime_home.into().join("api"); let storage_root = data_home.into().join("laravel-storage"); Self { runtime_root, logs_root: storage_root.join("logs"), uploads_root: storage_root.join("app"), sessions_root: storage_root.join("framework/sessions"), cache_root: storage_root.join("framework/cache"), storage_root } }
    pub fn is_durable(&self) -> bool { !self.storage_root.starts_with(&self.runtime_root) }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ApiRuntimeProfile { pub listen_host: String, pub port: u16, pub storage_path: String, pub command: String, pub required_extensions: BTreeSet<String> }
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ApiRuntimeError { MissingExtension(String), UnsafeCommand, UnsafeStorage, DisallowedArtisan(String) }
impl fmt::Display for ApiRuntimeError { fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result { match self { Self::MissingExtension(x)=>write!(f,"missing required PHP extension: {x}"), Self::UnsafeCommand=>write!(f,"production API runtime must not use php artisan serve"), Self::UnsafeStorage=>write!(f,"Laravel storage must be outside versioned runtime files"), Self::DisallowedArtisan(x)=>write!(f,"Artisan operation is not allow-listed: {x}") } } }
impl std::error::Error for ApiRuntimeError {}
impl ApiRuntimeProfile {
    pub fn frankenphp(layout: &ApiRuntimeLayout) -> Self { Self { listen_host: "127.0.0.1".into(), port: 8765, storage_path: layout.storage_root.display().to_string(), command: "frankenphp run --config /runtime/Caddyfile".into(), required_extensions: REQUIRED_EXTENSIONS.iter().map(|x| x.to_string()).collect() } }
    pub fn validate(&self, layout: &ApiRuntimeLayout, available_extensions: &BTreeSet<String>) -> Result<(), ApiRuntimeError> { if self.command.contains("artisan serve") { return Err(ApiRuntimeError::UnsafeCommand) } if !layout.is_durable() { return Err(ApiRuntimeError::UnsafeStorage) } for required in &self.required_extensions { if !available_extensions.contains(required) { return Err(ApiRuntimeError::MissingExtension(required.clone())) } } Ok(()) }
    pub fn allow_artisan(&self, operation: &str) -> Result<(), ApiRuntimeError> { if ALLOWED_ARTISAN.contains(&operation) { Ok(()) } else { Err(ApiRuntimeError::DisallowedArtisan(operation.into())) } }
}
#[cfg(test)] mod tests { use super::*; #[test] fn packaged_profile_requires_extensions_and_durable_storage() { let layout = ApiRuntimeLayout::machine_scoped("/opt/accore/runtime", "/var/lib/accore"); let profile=ApiRuntimeProfile::frankenphp(&layout); let extensions=REQUIRED_EXTENSIONS.iter().map(|x|x.to_string()).collect(); assert!(profile.validate(&layout,&extensions).is_ok()); assert!(profile.allow_artisan("migrate").is_ok()); assert!(profile.allow_artisan("tinker").is_err()); } #[test] fn rejects_development_server_command() { let layout=ApiRuntimeLayout::machine_scoped("/opt/runtime","/var/data"); let mut profile=ApiRuntimeProfile::frankenphp(&layout); profile.command="php artisan serve".into(); let extensions=REQUIRED_EXTENSIONS.iter().map(|x|x.to_string()).collect(); assert_eq!(profile.validate(&layout,&extensions),Err(ApiRuntimeError::UnsafeCommand)); } }
