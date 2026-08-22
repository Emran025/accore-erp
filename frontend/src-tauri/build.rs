use std::env;

fn main() {
    println!("cargo:rerun-if-env-changed=ACCORE_PRODUCT_FLAVOR");

    let has_server_feature = env::var_os("CARGO_FEATURE_SERVER_PRODUCT").is_some();
    let has_headless_server_feature = env::var_os("CARGO_FEATURE_HEADLESS_SERVER_PRODUCT").is_some();
    let has_client_feature = env::var_os("CARGO_FEATURE_CLIENT_PRODUCT").is_some();

    if (has_server_feature && has_headless_server_feature)
        || (has_server_feature && has_client_feature)
        || (has_headless_server_feature && has_client_feature)
    {
        panic!("server-product, headless-server-product, and client-product are mutually exclusive");
    }

    let requested_flavor = env::var("ACCORE_PRODUCT_FLAVOR").ok();
    let compiled_flavor = match (
        has_server_feature,
        has_headless_server_feature,
        has_client_feature,
        requested_flavor.as_deref(),
    ) {
        (true, false, false, Some("server")) | (true, false, false, None) => "server",
        (false, true, false, Some("server")) | (false, true, false, None) => "server",
        (false, false, true, Some("client")) | (false, false, true, None) => "client",
        (false, false, false, None) | (false, false, false, Some("development")) => "development",
        (true, false, false, Some(value)) => {
            panic!("server-product requires ACCORE_PRODUCT_FLAVOR=server, got {value}")
        }
        (false, true, false, Some(value)) => {
            panic!("headless-server-product requires ACCORE_PRODUCT_FLAVOR=server, got {value}")
        }
        (false, false, true, Some(value)) => {
            panic!("client-product requires ACCORE_PRODUCT_FLAVOR=client, got {value}")
        }
        (false, false, false, Some(value)) => {
            panic!("a product flavor feature is required for ACCORE_PRODUCT_FLAVOR={value}")
        }
        _ => unreachable!("feature conflict is handled above"),
    };

    println!("cargo:rustc-env=ACCORE_COMPILED_PRODUCT_FLAVOR={compiled_flavor}");
    tauri_build::build();
}
