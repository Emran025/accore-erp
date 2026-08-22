use std::path::PathBuf;

use serde::{Deserialize, Serialize};

pub const SERVER_INSTANCE_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum ServerProductFlavor {
    ServerDesktop,
    ServerHeadless,
}

impl ServerProductFlavor {
    pub fn parse(value: &str) -> Result<Self, String> {
        match value {
            "server-desktop" => Ok(Self::ServerDesktop),
            "server-headless" => Ok(Self::ServerHeadless),
            _ => Err("owner must be server-desktop or server-headless".into()),
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::ServerDesktop => "server-desktop",
            Self::ServerHeadless => "server-headless",
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerInstanceManifest {
    pub schema_version: u32,
    pub instance_id: String,
    pub server_id: String,
    pub owner_product: ServerProductFlavor,
    pub active_runtime_root: PathBuf,
    pub service_executable: PathBuf,
    pub service_config_path: PathBuf,
    pub updated_at: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InstallationDecision {
    ClaimOrUpdate,
    AttachAsDesktopManager,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UninstallDecision {
    ActiveRemoval,
    PassivePackageRemoval,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TransitionDecision {
    UpdateOwner,
}

pub fn decide_installation(
    existing: Option<&ServerInstanceManifest>,
    requested_owner: ServerProductFlavor,
) -> Result<InstallationDecision, String> {
    match existing {
        None => Ok(InstallationDecision::ClaimOrUpdate),
        Some(instance) if instance.owner_product == requested_owner => {
            Ok(InstallationDecision::ClaimOrUpdate)
        }
        Some(instance)
            if instance.owner_product == ServerProductFlavor::ServerHeadless
                && requested_owner == ServerProductFlavor::ServerDesktop =>
        {
            Ok(InstallationDecision::AttachAsDesktopManager)
        }
        Some(_) => Err(
            "a Server Desktop-owned instance requires an explicit transition before Server Headless can take ownership".into(),
        ),
    }
}

pub fn decide_uninstall(
    existing: Option<&ServerInstanceManifest>,
    requested_owner: ServerProductFlavor,
) -> Result<UninstallDecision, String> {
    match existing {
        None => Err("cannot remove a server instance without a server-instance manifest".into()),
        Some(instance) if instance.owner_product == requested_owner => {
            Ok(UninstallDecision::ActiveRemoval)
        }
        Some(_) => Ok(UninstallDecision::PassivePackageRemoval),
    }
}

pub fn decide_transition(
    existing: Option<&ServerInstanceManifest>,
    from: ServerProductFlavor,
    to: ServerProductFlavor,
) -> Result<TransitionDecision, String> {
    let instance =
        existing.ok_or("cannot transition a server instance without a server-instance manifest")?;
    if instance.owner_product != from {
        return Err("the declared transition source does not own the current server instance".into());
    }
    if from == to {
        return Err("a server instance transition requires different source and destination owners".into());
    }
    Ok(TransitionDecision::UpdateOwner)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum PublicInstanceState {
    Active,
    Transitioning,
    Removed,
}

impl PublicInstanceState {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Transitioning => "transitioning",
            Self::Removed => "removed",
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicServerInstanceReceipt {
    pub schema_version: u32,
    pub instance_id: String,
    pub server_id: String,
    pub owner_product: ServerProductFlavor,
    pub state: PublicInstanceState,
    pub operation_id: String,
    pub updated_at: u64,
}

impl PublicServerInstanceReceipt {
    pub fn active(manifest: &ServerInstanceManifest, operation_id: String) -> Self {
        Self {
            schema_version: SERVER_INSTANCE_SCHEMA_VERSION,
            instance_id: manifest.instance_id.clone(),
            server_id: manifest.server_id.clone(),
            owner_product: manifest.owner_product,
            state: PublicInstanceState::Active,
            operation_id,
            updated_at: manifest.updated_at,
        }
    }

    pub fn transitioning(
        manifest: &ServerInstanceManifest,
        destination_owner: ServerProductFlavor,
        operation_id: String,
        updated_at: u64,
    ) -> Self {
        Self {
            schema_version: SERVER_INSTANCE_SCHEMA_VERSION,
            instance_id: manifest.instance_id.clone(),
            server_id: manifest.server_id.clone(),
            owner_product: destination_owner,
            state: PublicInstanceState::Transitioning,
            operation_id,
            updated_at,
        }
    }

    pub fn removed(manifest: &ServerInstanceManifest, operation_id: String) -> Self {
        Self {
            schema_version: SERVER_INSTANCE_SCHEMA_VERSION,
            instance_id: manifest.instance_id.clone(),
            server_id: manifest.server_id.clone(),
            owner_product: manifest.owner_product,
            state: PublicInstanceState::Removed,
            operation_id,
            updated_at: manifest.updated_at,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn manifest(owner_product: ServerProductFlavor) -> ServerInstanceManifest {
        ServerInstanceManifest {
            schema_version: SERVER_INSTANCE_SCHEMA_VERSION,
            instance_id: "instance-1".into(),
            server_id: "server-1".into(),
            owner_product,
            active_runtime_root: PathBuf::from("C:/Program Files/ACCORE/runtime"),
            service_executable: PathBuf::from("C:/Program Files/ACCORE/accore-server-agent.exe"),
            service_config_path: PathBuf::from("C:/ProgramData/ACCORE ERP/Server/agent-config.json"),
            updated_at: 1,
        }
    }

    #[test]
    fn fresh_install_claims_an_unowned_instance() {
        assert_eq!(
            decide_installation(None, ServerProductFlavor::ServerHeadless),
            Ok(InstallationDecision::ClaimOrUpdate)
        );
    }

    #[test]
    fn owner_update_reconciles_the_existing_instance() {
        assert_eq!(
            decide_installation(
                Some(&manifest(ServerProductFlavor::ServerHeadless)),
                ServerProductFlavor::ServerHeadless
            ),
            Ok(InstallationDecision::ClaimOrUpdate)
        );
    }

    #[test]
    fn desktop_attaches_to_a_headless_owned_instance() {
        assert_eq!(
            decide_installation(
                Some(&manifest(ServerProductFlavor::ServerHeadless)),
                ServerProductFlavor::ServerDesktop
            ),
            Ok(InstallationDecision::AttachAsDesktopManager)
        );
    }

    #[test]
    fn headless_cannot_implicitly_take_a_desktop_owned_instance() {
        assert!(decide_installation(
            Some(&manifest(ServerProductFlavor::ServerDesktop)),
            ServerProductFlavor::ServerHeadless
        )
        .is_err());
    }

    #[test]
    fn non_owner_uninstall_is_passive() {
        assert_eq!(
            decide_uninstall(
                Some(&manifest(ServerProductFlavor::ServerHeadless)),
                ServerProductFlavor::ServerDesktop
            ),
            Ok(UninstallDecision::PassivePackageRemoval)
        );
    }

    #[test]
    fn transition_requires_the_declared_current_owner() {
        assert_eq!(
            decide_transition(
                Some(&manifest(ServerProductFlavor::ServerDesktop)),
                ServerProductFlavor::ServerDesktop,
                ServerProductFlavor::ServerHeadless
            ),
            Ok(TransitionDecision::UpdateOwner)
        );
        assert!(decide_transition(
            Some(&manifest(ServerProductFlavor::ServerDesktop)),
            ServerProductFlavor::ServerHeadless,
            ServerProductFlavor::ServerDesktop
        )
        .is_err());
    }

    #[test]
    fn public_receipt_exposes_identity_without_runtime_or_secret_paths() {
        let receipt = PublicServerInstanceReceipt::active(
            &manifest(ServerProductFlavor::ServerHeadless),
            "operation-1".into(),
        );
        let json = serde_json::to_string(&receipt).expect("serialize public receipt");
        assert!(json.contains("instance-1"));
        assert!(!json.contains("Program Files"));
    }
}
