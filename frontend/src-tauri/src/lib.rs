#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub mod client_connection;
pub mod credential_key;
pub mod distribution;
pub mod product;
#[cfg(feature = "server-product")]
pub mod server_runtime;

fn application_builder() -> tauri::Builder<tauri::Wry> {
    tauri::Builder::default().setup(|app| {
        app.handle()
            .plugin(tauri_plugin_updater::Builder::new().build())?;
        app.handle().plugin(tauri_plugin_process::init())?;

        #[cfg(all(
            not(feature = "server-product"),
            not(feature = "headless-server-product")
        ))]
        {
            use tauri::Manager;

            let salt_path = app
                .path()
                .app_local_data_dir()
                .map_err(|error| format!("failed to resolve Stronghold salt path: {error}"))?
                .join("stronghold-salt-v1");

            app.handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;
        }

        if cfg!(debug_assertions) {
            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .level(log::LevelFilter::Info)
                    .build(),
            )?;
        }
        Ok(())
    })
}

pub fn run() {
    #[cfg(feature = "headless-server-product")]
    {
        // The Headless package is installed and supervised exclusively by the
        // Windows Service Agent. Its bundled executable intentionally has no
        // Tauri window or web workflow to launch.
        return;
    }

    #[cfg(feature = "server-product")]
    application_builder()
        .invoke_handler(tauri::generate_handler![
            product::product_runtime_profile,
            product::server_runtime_configuration,
            server_runtime::server_runtime_status,
            server_runtime::server_runtime_start,
            server_runtime::server_runtime_stop,
            server_runtime::server_backup_status,
            server_runtime::trigger_server_backup,
            server_runtime::prepare_server_desktop_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Accore Server");

    #[cfg(all(
        not(feature = "server-product"),
        not(feature = "headless-server-product")
    ))]
    application_builder()
        .invoke_handler(tauri::generate_handler![
            product::product_runtime_profile,
            client_connection::read_client_connection_profile,
            client_connection::write_client_connection_profile,
            client_connection::remove_client_connection_profile,
            credential_key::desktop_credential_vault_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Accore Client or development build");
}
