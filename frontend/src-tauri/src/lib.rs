#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub mod distribution;
pub mod product;

fn application_builder() -> tauri::Builder<tauri::Wry> {
    tauri::Builder::default().setup(|app| {
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
    #[cfg(feature = "server-product")]
    application_builder()
        .invoke_handler(tauri::generate_handler![
            product::product_runtime_profile,
            product::server_runtime_configuration,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Accore Server");

    #[cfg(not(feature = "server-product"))]
    application_builder()
        .invoke_handler(tauri::generate_handler![product::product_runtime_profile])
        .run(tauri::generate_context!())
        .expect("error while running Accore Client or development build");
}
