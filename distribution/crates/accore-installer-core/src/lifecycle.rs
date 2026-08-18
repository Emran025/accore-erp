use std::path::PathBuf;

/// Describes a safe maintenance operation. These values are policy inputs for the
/// platform setup adapter; executing them remains an OS-specific responsibility.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MaintenanceOperation {
    Repair,
    Uninstall,
}

/// Customer-owned state is retained unless a later, explicitly authorized data
/// administration workflow is introduced. Normal maintenance never deletes it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CustomerDataDisposition {
    Preserve,
}

/// The durable contract for maintenance invoked by setup UX or enterprise tooling.
/// Repair may replace application and runtime files. Uninstall may remove only the
/// application registration and executables. Neither action deletes ERP data,
/// database files, nor backups.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MaintenancePlan {
    pub operation: MaintenanceOperation,
    pub customer_data: CustomerDataDisposition,
    pub database_files: CustomerDataDisposition,
    pub backups: CustomerDataDisposition,
}

impl MaintenancePlan {
    pub const fn repair() -> Self {
        Self {
            operation: MaintenanceOperation::Repair,
            customer_data: CustomerDataDisposition::Preserve,
            database_files: CustomerDataDisposition::Preserve,
            backups: CustomerDataDisposition::Preserve,
        }
    }

    pub const fn uninstall() -> Self {
        Self {
            operation: MaintenanceOperation::Uninstall,
            customer_data: CustomerDataDisposition::Preserve,
            database_files: CustomerDataDisposition::Preserve,
            backups: CustomerDataDisposition::Preserve,
        }
    }
}

/// Safe channels through which a non-interactive setup may obtain a secret.
/// Command-line arguments are intentionally not representable because process
/// listings, shell history, and deployment logs can disclose them.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SecretInput {
    None,
    StandardInput,
    ProtectedFile(PathBuf),
    PlatformSecretReference(String),
}

/// Supported non-interactive administrative inputs. A response file carries only
/// non-secret policy choices, while secrets must use [`SecretInput`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NonInteractiveAdministration {
    pub response_file: PathBuf,
    pub offline_package: Option<PathBuf>,
    pub secret_input: SecretInput,
}

impl NonInteractiveAdministration {
    pub fn uses_secret_safe_channel(&self) -> bool {
        matches!(
            self.secret_input,
            SecretInput::None
                | SecretInput::StandardInput
                | SecretInput::ProtectedFile(_)
                | SecretInput::PlatformSecretReference(_)
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normal_maintenance_preserves_all_customer_owned_state() {
        for plan in [MaintenancePlan::repair(), MaintenancePlan::uninstall()] {
            assert_eq!(plan.customer_data, CustomerDataDisposition::Preserve);
            assert_eq!(plan.database_files, CustomerDataDisposition::Preserve);
            assert_eq!(plan.backups, CustomerDataDisposition::Preserve);
        }
    }

    #[test]
    fn non_interactive_contract_supports_only_secret_safe_delivery_channels() {
        let options = NonInteractiveAdministration {
            response_file: PathBuf::from("/etc/accore/setup-response.json"),
            offline_package: Some(PathBuf::from("/mnt/media/accore-server.accorepkg")),
            secret_input: SecretInput::StandardInput,
        };
        assert!(options.uses_secret_safe_channel());
    }
}
