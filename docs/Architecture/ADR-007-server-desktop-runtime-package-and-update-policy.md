# ADR-007: Server Desktop Runtime Package and Update Policy

**Status:** Accepted
**Date:** 2026-08-20
**Decision owner:** Distribution, release, and operations architecture

## Context

Server Desktop needs independently verifiable runtime components without coupling customer data to executable updates. The distribution program already defines signed product manifests and a content-addressable package store; the server runtime must use that foundation rather than downloading unsigned executables during startup.

## Decision

Every runtime component is delivered in a signed `accorepkg` artifact containing product flavor, semantic version, operating system, architecture, SHA-256, signature, source license notices, and compatibility metadata. The installer verifies the artifact before extraction and atomically promotes it into the machine cache. The agent activates a compatible runtime into `%ProgramFiles%\\ACCORE ERP Server Desktop\\runtime` only after its digest, signature, and compatibility contract validate.

The active runtime is versioned. Database files, secrets, Laravel storage, backups, and diagnostics remain in `%ProgramData%\\ACCORE ERP\\Server` and are never part of a runtime package. The update coordinator records the previous active runtime and rolls back executables if a new API fails its readiness budget; it never rolls back or deletes customer data automatically.

Desktop application releases additionally use the Tauri updater with a pinned public key, HTTPS release endpoint, and per-platform artifact signature. Client Desktop checks the signed stable release metadata during application startup and automatically downloads, verifies, installs, and relaunches a newer version. Server Desktop follows the same discovery and verification path but downloads the signed package before requesting any service control operation. Only after the package is locally verified does it request an ordered Agent shutdown, hand the package to the installer, and allow the installer to activate the update.

If a Server Desktop installer handoff fails after the Agent has stopped, the application restarts the managed local service before surfacing the failure. A failed metadata request, unavailable update, or failed download leaves the local service running because shutdown has not yet been requested. Windows elevation prompts required for protected service control remain operating-system mediated; they are not replaced by an application-level privilege bypass.

## Consequences

The release pipeline must produce a desktop installer, the signed API runtime package, the signed database runtime package, and a manifest that declares their compatible versions. The UI shows package verification and activation progress. Offline installation may import the same signed packages, but a modified or incomplete package is rejected before extraction.

## Validation

Tests cover invalid signatures, digest mismatch, interrupted download resumption, duplicate package locking, offline import, activation rollback after a failed API probe, automatic updater discovery, download-before-shutdown ordering, recovery after installer handoff failure, and the invariant that cache directories do not contain customer data or generated secrets.
