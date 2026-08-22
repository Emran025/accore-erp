# ADR-009: Headless Server Deployment and First-Client Enrollment

**Status:** Accepted for the 0.0.1 baseline

**Date:** 2026-08-22

**Decision owner:** Desktop, platform, security, and operations architecture

## Context

ACCORE ERP must support two complementary server operating models without requiring a separately installed PHP runtime, Node.js installation, MariaDB service, or browser-based server console. The existing Windows x64 Server Desktop product serves a single workstation through an embedded Tauri interface and an `ACCOREServerAgent` Windows Service. Organisations also require a non-interactive deployment for terminal servers, dedicated Windows servers, and remote-hosted Windows virtual machines.

The headless path must start and survive without any desktop application being launched. It must retain the same durable data root, verified runtime packages, backup and update invariants, and local-only lifecycle control as Server Desktop. It must also allow a deliberately authorised first Client Desktop device to claim an uninitialised deployment, establish a verified connection profile, and then complete ordinary authenticated ACCORE setup.

## Decision

The 0.0.1 baseline defines the following delivery modes.

| Mode | Primary audience | Installer behavior | Runtime behavior | Network behavior |
|---|---|---|---|---|
| **Server Desktop** | A user operating the server on a Windows workstation | Interactive installation with the existing UI | Registers and supervises `ACCOREServerAgent` | Loopback API by default |
| **Server Headless** | Windows terminal servers, dedicated servers, and VPS hosts | Per-machine NSIS installer; supports uppercase `/S`; does not launch a Tauri window or create a desktop workflow | Installs the same signed runtime, registers `ACCOREServerAgent` for automatic start, and provisions in the background | Loopback API by default; remote publication requires an explicit TLS deployment contract |
| **Future Linux/macOS Headless** | Supported only after platform runtime, service adapter, packaging, and acceptance validation exist | No release asset in 0.0.1 | Must preserve the same Agent, durable-data, enrollment, and signed-package contracts | Must never expose MariaDB or lifecycle control remotely |

### Headless installer contract

The Windows Headless installer is a distinct, signed release asset rather than a hidden execution mode of a desktop window. It installs only the runtime assets and Agent service layout needed to host ACCORE ERP. Its post-install action invokes the Agent through the installer process, registers the Windows service for automatic start, and waits only for service hand-off. It does not open PowerShell, a terminal, a browser window, or the Server Desktop UI.

The installer must be machine-scoped and placed under `%ProgramFiles%`. It uses the durable root `%ProgramData%\ACCORE ERP\Server` and preserves it across runtime replacement or uninstallation unless an administrator explicitly performs a separately guarded data-removal operation. MariaDB remains bound to `127.0.0.1:3307` in every mode.

### Remote-access contract

Headless installation does **not** treat opening a raw HTTP listener as remote enablement. The default Agent API listener remains loopback-only. A remote deployment must instead use an explicit TLS publication contract that declares a canonical `https` API URL, server identity, certificate fingerprint or equivalent trust binding, and an approved boundary for the upstream loopback API. Supported publication mechanisms are a managed reverse proxy or a later direct TLS adapter backed by a supplied certificate lifecycle. The Agent's lifecycle, backup, stop, seed, and update controls remain local-only and are never exposed through TCP.

### First-client enrollment contract

During first bootstrap the Agent creates a server identity and an expiring, single-use initial enrollment evidence value. It writes the resulting pairing package only to an administrator-restricted local path. An administrator transfers this package to the intended Client Desktop through an approved secure channel. The client verifies the server bootstrap contract, TLS identity binding, semantic-version compatibility, and one-time evidence before a desktop device record is created.

The first successfully enrolled device is marked as the server's primary administration device inside the same transaction that consumes the evidence. The designation is an operational ownership marker; it does not replace ACCORE user authentication. The user still signs in through the established password-based authentication and setup flow, and the seeded administrator is neither reset nor exposed by the installer. Later device enrollment must be authorised by an already authenticated administrator or by a separately issued local administrative enrollment package.

## Security and operational invariants

1. No clear-text remote ERP API is allowed in the client pairing contract.
2. Database, runtime secrets, enrollment evidence, private keys, backup artifacts, and Agent configuration remain outside release assets and retain restricted ACLs.
3. The service is installed and started by an elevated installer, but no administrative secret is passed to the command line, a log, or a public status file.
4. The public runtime status remains redacted and read-only; it may identify readiness and server identity but cannot disclose credentials or enrollment evidence.
5. A failed or interrupted Headless installation never removes an existing durable data root, and an update cannot replace customer data.
6. The 0.0.1 version guard remains authoritative across package metadata, Tauri configuration, Cargo configuration, silent-installer asset naming, and documentation until a separate version decision is approved.

## Consequences

The Windows release pipeline must build and verify both Server Desktop and Server Headless artifacts from the same pinned embedded runtime and Agent revision. The Headless artifact is not a Tauri updater target; it follows the signed runtime package and health-gated Agent activation policy. The pipeline must test a non-interactive install, service auto-start, no-window invariant, status publication, protected initial pairing package creation, first-device claim, restart continuity, and normal uninstallation without durable-data deletion.

The existing client pairing surface can continue to accept manual, QR, and pairing-file input. It must persist public server metadata separately from encrypted device credentials and require `https` for remote endpoints. The remote host may run without a graphical session after installation; client access is an explicit server-connection decision, not an implicit desktop-local assumption.

## References

[1] [ADR-004: Server Desktop Runtime and Durable Storage](ADR-004-server-desktop-runtime-and-storage.md)

[2] [ADR-006: Server Desktop Trust and Network Exposure](ADR-006-server-desktop-trust-and-network-exposure.md)

[3] [ADR-007: Server Desktop Runtime Package and Update Policy](ADR-007-server-desktop-runtime-package-and-update-policy.md)

[4] [Tauri Windows Installer documentation](https://v2.tauri.app/distribute/windows-installer/)
