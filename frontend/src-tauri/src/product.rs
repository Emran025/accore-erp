#[cfg(all(feature = "server-product", feature = "client-product"))]
compile_error!("server-product and client-product must never be enabled together");

use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ProductFlavor {
    Server,
    Client,
    Development,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductRuntimeProfile {
    pub flavor: ProductFlavor,
    pub updater_channel: &'static str,
    pub allows_local_server_management: bool,
}

pub fn compiled_product_flavor() -> ProductFlavor {
    match option_env!("ACCORE_COMPILED_PRODUCT_FLAVOR") {
        Some("server") => ProductFlavor::Server,
        Some("client") => ProductFlavor::Client,
        Some("development") | None => ProductFlavor::Development,
        Some(value) => panic!("invalid compiled Accore product flavor: {value}"),
    }
}

#[tauri::command]
pub fn product_runtime_profile() -> ProductRuntimeProfile {
    match compiled_product_flavor() {
        ProductFlavor::Server => ProductRuntimeProfile {
            flavor: ProductFlavor::Server,
            updater_channel: "server-stable",
            allows_local_server_management: true,
        },
        ProductFlavor::Client => ProductRuntimeProfile {
            flavor: ProductFlavor::Client,
            updater_channel: "client-stable",
            allows_local_server_management: false,
        },
        ProductFlavor::Development => ProductRuntimeProfile {
            flavor: ProductFlavor::Development,
            updater_channel: "development",
            allows_local_server_management: false,
        },
    }
}

/// Server-only configuration discovery. This command deliberately does not start,
/// stop, or control a service; Service Agent control is introduced in Issue #43.
#[cfg(feature = "server-product")]
#[tauri::command]
pub fn server_runtime_configuration() -> ServerRuntimeConfiguration {
    ServerRuntimeConfiguration {
        loopback_api_base: "http://127.0.0.1:8765/api",
        control_surface: "server-desktop",
    }
}

#[cfg(feature = "server-product")]
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerRuntimeConfiguration {
    pub loopback_api_base: &'static str,
    pub control_surface: &'static str,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(feature = "server-product")]
    #[test]
    fn server_runtime_configuration_is_available_only_in_the_server_build() {
        assert_eq!(
            server_runtime_configuration(),
            ServerRuntimeConfiguration {
                loopback_api_base: "http://127.0.0.1:8765/api",
                control_surface: "server-desktop",
            }
        );
    }

    #[test]
    fn runtime_profile_has_a_separate_update_channel_per_product() {
        let profile = product_runtime_profile();
        match profile.flavor {
            ProductFlavor::Server => {
                assert_eq!(profile.updater_channel, "server-stable");
                assert!(profile.allows_local_server_management);
            }
            ProductFlavor::Client => {
                assert_eq!(profile.updater_channel, "client-stable");
                assert!(!profile.allows_local_server_management);
            }
            ProductFlavor::Development => {
                assert_eq!(profile.updater_channel, "development");
                assert!(!profile.allows_local_server_management);
            }
        }
    }
}
