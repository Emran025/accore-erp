use std::{
    fmt,
    fs::{self, OpenOptions},
    io::Write,
    path::PathBuf,
};

use serde::Serialize;

use crate::JournalRecord;

#[derive(Debug, Clone)]
pub struct SupportBundleInput<'a> {
    pub installation_id: &'a str,
    pub generated_at: &'a str,
    pub journal: Option<&'a JournalRecord>,
    pub diagnostics: &'a str,
}

#[derive(Debug)]
pub enum SupportBundleError {
    Io(String),
    Serialization(String),
    InvalidInstallationId,
}

impl fmt::Display for SupportBundleError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(message) => write!(formatter, "support bundle I/O error: {message}"),
            Self::Serialization(message) => write!(formatter, "support bundle serialization error: {message}"),
            Self::InvalidInstallationId => write!(formatter, "support bundle installation identifier is invalid"),
        }
    }
}

impl std::error::Error for SupportBundleError {}

impl From<std::io::Error> for SupportBundleError {
    fn from(error: std::io::Error) -> Self {
        Self::Io(error.to_string())
    }
}

#[derive(Serialize)]
struct SupportBundle<'a> {
    schema_version: u16,
    installation_id: &'a str,
    generated_at: &'a str,
    journal: Option<&'a JournalRecord>,
    diagnostics: String,
    redaction: &'static str,
}

/// Redacts secrets by key and bearer-style values before diagnostics can enter a
/// support bundle. The output intentionally keeps a small amount of context for
/// support engineers while never preserving credentials or signing material.
pub fn redact_diagnostic_text(input: &str) -> String {
    input
        .lines()
        .map(|line| redact_line(line))
        .collect::<Vec<_>>()
        .join("\n")
}

fn redact_line(line: &str) -> String {
    let sensitive_keys = [
        "APP_KEY",
        "APP_SECRET",
        "PASSWORD",
        "TOKEN",
        "AUTHORIZATION",
        "ED25519",
        "PRIVATE_KEY",
        "SIGNING_KEY",
        "DATABASE_URL",
    ];
    let uppercase = line.to_ascii_uppercase();
    if sensitive_keys.iter().any(|key| uppercase.contains(key)) {
        if let Some((key, _)) = line.split_once('=') {
            return format!("{key}=<redacted>");
        }
        if let Some((key, _)) = line.split_once(':') {
            return format!("{key}: <redacted>");
        }
        return "<redacted sensitive diagnostic line>".into();
    }
    if uppercase.contains("BEARER ") {
        return "Authorization: Bearer <redacted>".into();
    }
    line.into()
}

pub fn write_redacted_support_bundle(
    output_root: impl Into<PathBuf>,
    input: SupportBundleInput<'_>,
) -> Result<PathBuf, SupportBundleError> {
    if input.installation_id.is_empty() || input.installation_id.contains(['/', '\\']) {
        return Err(SupportBundleError::InvalidInstallationId);
    }
    let output_root = output_root.into();
    fs::create_dir_all(&output_root)?;
    let output_path = output_root.join(format!("accore-support-{}.json", input.installation_id));
    let bundle = SupportBundle {
        schema_version: 1,
        installation_id: input.installation_id,
        generated_at: input.generated_at,
        journal: input.journal,
        diagnostics: redact_diagnostic_text(input.diagnostics),
        redaction: "Credentials, tokens, APP_KEY, and signing material are redacted.",
    };
    let bytes = serde_json::to_vec_pretty(&bundle)
        .map_err(|error| SupportBundleError::Serialization(error.to_string()))?;
    let temporary = output_path.with_extension(format!("tmp-{}", std::process::id()));
    {
        let mut file = OpenOptions::new().create_new(true).write(true).open(&temporary)?;
        file.write_all(&bytes)?;
        file.sync_all()?;
    }
    fs::rename(&temporary, &output_path)?;
    Ok(output_path)
}

#[cfg(test)]
mod tests {
    use super::redact_diagnostic_text;

    #[test]
    fn redacts_credentials_tokens_and_signing_material() {
        let diagnostics = "APP_KEY=base64:secret\napi_token: abc\nAuthorization: Bearer opaque\nstatus=healthy";
        let redacted = redact_diagnostic_text(diagnostics);
        assert!(redacted.contains("APP_KEY=<redacted>"));
        assert!(redacted.contains("api_token: <redacted>"));
        assert!(redacted.contains("Authorization: <redacted>"));
        assert!(redacted.contains("status=healthy"));
        assert!(!redacted.contains("secret"));
        assert!(!redacted.contains("opaque"));
    }
}
