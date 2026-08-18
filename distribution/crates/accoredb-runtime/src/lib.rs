//! Private, durable AccoreDB runtime contract.
//!
//! This crate defines the immutable security and storage policy for the packaged
//! MySQL-compatible runtime. A platform process adapter supplies the actual
//! `mysqld` invocation and command execution.

use std::{fmt, path::{Path, PathBuf}};

pub const LOOPBACK_HOST: &str = "127.0.0.1";
pub const DEFAULT_PORT: u16 = 3307;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AccoreDbLayout {
    pub runtime_root: PathBuf,
    pub data_root: PathBuf,
    pub backup_root: PathBuf,
    pub validation_root: PathBuf,
}

impl AccoreDbLayout {
    pub fn machine_scoped(runtime_home: impl Into<PathBuf>, data_home: impl Into<PathBuf>) -> Self {
        let runtime_home = runtime_home.into();
        let data_home = data_home.into();
        Self {
            runtime_root: runtime_home.join("accoredb"),
            data_root: data_home.join("accoredb").join("data"),
            backup_root: data_home.join("accoredb").join("backups"),
            validation_root: data_home.join("accoredb").join("restore-validation"),
        }
    }

    pub fn is_durable_and_separate(&self) -> bool {
        !self.data_root.starts_with(&self.runtime_root)
            && !self.backup_root.starts_with(&self.runtime_root)
            && !self.validation_root.starts_with(&self.runtime_root)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DatabaseProfile {
    pub host: String,
    pub port: u16,
    pub database: String,
    pub application_user: String,
    pub application_secret_reference: String,
    pub bind_address: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AccoreDbError {
    UnsafeBinding(String),
    RootAccountForbidden,
    UnsafePath,
    InvalidAccount,
}

impl fmt::Display for AccoreDbError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnsafeBinding(address) => write!(formatter, "AccoreDB must not bind to non-loopback address: {address}"),
            Self::RootAccountForbidden => write!(formatter, "Laravel production profile must not use the MySQL root account"),
            Self::UnsafePath => write!(formatter, "AccoreDB durable data and runtime paths must be separate"),
            Self::InvalidAccount => write!(formatter, "application account must be a local non-root principal"),
        }
    }
}
impl std::error::Error for AccoreDbError {}

impl DatabaseProfile {
    pub fn production(database: impl Into<String>, secret_reference: impl Into<String>) -> Self {
        Self {
            host: LOOPBACK_HOST.into(),
            port: DEFAULT_PORT,
            database: database.into(),
            application_user: "accore_app".into(),
            application_secret_reference: secret_reference.into(),
            bind_address: LOOPBACK_HOST.into(),
        }
    }

    pub fn validate(&self) -> Result<(), AccoreDbError> {
        if self.bind_address != LOOPBACK_HOST || self.host != LOOPBACK_HOST {
            return Err(AccoreDbError::UnsafeBinding(self.bind_address.clone()));
        }
        if self.application_user.eq_ignore_ascii_case("root") {
            return Err(AccoreDbError::RootAccountForbidden);
        }
        if self.application_user.is_empty() || self.application_user.contains(['@', '\'', '"']) {
            return Err(AccoreDbError::InvalidAccount);
        }
        Ok(())
    }

    /// Database initialization receives a generated secret from the platform secret
    /// store, never a literal password that could enter logs or a release artifact.
    pub fn least_privilege_sql(&self) -> Result<Vec<String>, AccoreDbError> {
        self.validate()?;
        Ok(vec![
            format!("CREATE DATABASE IF NOT EXISTS `{}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", self.database),
            format!("CREATE USER IF NOT EXISTS '{}'@'localhost' IDENTIFIED BY <secret-from-platform-store>;", self.application_user),
            format!("GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES ON `{}`.* TO '{}'@'localhost';", self.database, self.application_user),
            "FLUSH PRIVILEGES;".into(),
        ])
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BackupValidationStage { Export, RestoreIsolated, IntegrityProbe, CleanUp }

pub trait BackupRuntime {
    fn export(&mut self, destination: &Path) -> Result<(), AccoreDbError>;
    fn restore_isolated(&mut self, source: &Path, validation_data_root: &Path) -> Result<(), AccoreDbError>;
    fn integrity_probe(&mut self, validation_data_root: &Path) -> Result<(), AccoreDbError>;
    fn cleanup_validation(&mut self, validation_data_root: &Path) -> Result<(), AccoreDbError>;
}

pub fn validate_backup(runtime: &mut impl BackupRuntime, layout: &AccoreDbLayout, archive: &Path) -> Result<(), AccoreDbError> {
    if !layout.is_durable_and_separate() { return Err(AccoreDbError::UnsafePath); }
    runtime.export(archive)?;
    runtime.restore_isolated(archive, &layout.validation_root)?;
    runtime.integrity_probe(&layout.validation_root)?;
    runtime.cleanup_validation(&layout.validation_root)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn production_profile_is_loopback_and_non_root() {
        let profile = DatabaseProfile::production("accore", "secret://accoredb/app");
        assert!(profile.validate().is_ok());
        assert!(profile.least_privilege_sql().unwrap().iter().all(|statement| !statement.contains("'root'")));
    }

    #[test]
    fn rejects_lan_binding_and_root_account() {
        let mut profile = DatabaseProfile::production("accore", "secret://accoredb/app");
        profile.bind_address = "0.0.0.0".into();
        assert!(matches!(profile.validate(), Err(AccoreDbError::UnsafeBinding(_))));
        profile.bind_address = LOOPBACK_HOST.into();
        profile.application_user = "root".into();
        assert_eq!(profile.validate(), Err(AccoreDbError::RootAccountForbidden));
    }

    #[test]
    fn durable_data_does_not_live_under_runtime_binaries() {
        let layout = AccoreDbLayout::machine_scoped("/opt/accore/runtime", "/var/lib/accore");
        assert!(layout.is_durable_and_separate());
    }
}
