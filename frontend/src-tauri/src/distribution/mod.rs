//! Desktop bridge to the reusable verified installer core.
//!
//! Installer state, trust checks, caching, recovery journals, and diagnostic
//! redaction live in `accore-installer-core` so setup tools cannot drift from
//! the desktop product's release contract.

pub use accore_installer_core::*;
