use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const CLIENT_CONNECTION_PROFILE_FILE: &str = "client-connection-profile.json";

/// Public, non-secret information required to identify a verified Accore Server.
/// Access tokens and other credentials are intentionally excluded and will be
/// introduced through the encrypted credential store in Issue #50.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientConnectionProfile {
    pub api_base: String,
    pub server_id: String,
    pub server_name: String,
    pub certificate_fingerprint: Option<String>,
    pub api_contract: String,
    pub verified_at: String,
    pub device_id: String,
}

fn profile_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("failed to resolve app data directory: {error}"))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|error| format!("failed to create app data directory: {error}"))?;

    Ok(app_data_dir.join(CLIENT_CONNECTION_PROFILE_FILE))
}

#[tauri::command]
pub fn read_client_connection_profile(
    app: AppHandle,
) -> Result<Option<ClientConnectionProfile>, String> {
    let path = profile_path(&app)?;

    if !path.exists() {
        return Ok(None);
    }

    let contents = fs::read_to_string(&path)
        .map_err(|error| format!("failed to read client connection profile: {error}"))?;
    let profile = serde_json::from_str::<ClientConnectionProfile>(&contents)
        .map_err(|error| format!("failed to parse client connection profile: {error}"))?;

    Ok(Some(profile))
}

#[tauri::command]
pub fn write_client_connection_profile(
    app: AppHandle,
    profile: ClientConnectionProfile,
) -> Result<(), String> {
    let path = profile_path(&app)?;
    let serialized = serde_json::to_vec_pretty(&profile)
        .map_err(|error| format!("failed to serialize client connection profile: {error}"))?;
    let temporary_path = path.with_extension("tmp");

    fs::write(&temporary_path, serialized)
        .map_err(|error| format!("failed to write client connection profile: {error}"))?;
    fs::rename(&temporary_path, &path)
        .map_err(|error| format!("failed to commit client connection profile: {error}"))?;

    Ok(())
}

#[tauri::command]
pub fn remove_client_connection_profile(app: AppHandle) -> Result<(), String> {
    let path = profile_path(&app)?;

    if path.exists() {
        fs::remove_file(&path)
            .map_err(|error| format!("failed to remove client connection profile: {error}"))?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn profile_serialization_excludes_credentials_by_design() {
        let profile = ClientConnectionProfile {
            api_base: "https://server.example.test/api".to_string(),
            server_id: "server-001".to_string(),
            server_name: "Accore Server".to_string(),
            certificate_fingerprint: Some("a".repeat(64)),
            api_contract: "desktop-v1".to_string(),
            verified_at: "2026-08-18T00:00:00Z".to_string(),
            device_id: "11111111-1111-4111-8111-111111111111".to_string(),
        };

        let serialized = serde_json::to_value(profile).expect("profile should serialize");
        let object = serialized.as_object().expect("profile should serialize to an object");

        assert!(object.contains_key("apiBase"));
        assert!(object.contains_key("deviceId"));
        assert!(!object.contains_key("deviceAccessToken"));
        assert!(!object.contains_key("enrollmentEvidence"));
    }
}
