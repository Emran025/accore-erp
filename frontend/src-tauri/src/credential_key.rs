use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use keyring::{Entry, Error as KeyringError};
use rand::rngs::OsRng;
use rand::RngCore;

const KEYCHAIN_SERVICE: &str = "com.accore.erp.client";
const KEYCHAIN_ACCOUNT: &str = "stronghold-vault-key-v1";
const VAULT_KEY_BYTES: usize = 32;

fn keychain_entry() -> Result<Entry, String> {
    Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
        .map_err(|error| format!("failed to access the desktop credential store: {error}"))
}

fn generate_vault_key() -> String {
    let mut bytes = [0_u8; VAULT_KEY_BYTES];
    OsRng.fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

/// Retrieves the per-installation Stronghold password from the operating
/// system's credential store. The value is returned only to bundled Client
/// code at runtime and must never be persisted by the WebView.
#[tauri::command]
pub fn desktop_credential_vault_key() -> Result<String, String> {
    let entry = keychain_entry()?;

    match entry.get_password() {
        Ok(value) if !value.trim().is_empty() => Ok(value),
        Ok(_) | Err(KeyringError::NoEntry) => {
            let vault_key = generate_vault_key();
            entry
                .set_password(&vault_key)
                .map_err(|error| format!("failed to save the desktop credential key: {error}"))?;
            Ok(vault_key)
        }
        Err(error) => Err(format!(
            "failed to read the desktop credential key from the operating system store: {error}"
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generated_vault_keys_are_random_url_safe_values() {
        let first = generate_vault_key();
        let second = generate_vault_key();

        assert_ne!(first, second);
        assert_eq!(first.len(), 43);
        assert!(first
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-' || byte == b'_'));
    }
}
