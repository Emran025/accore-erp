# ADR-011: Windows Server Instance Ownership and Runtime Preflight

**Status:** Accepted for implementation on the `0.0.1` baseline  
**Date:** 2026-08-22  
**Decision owner:** Desktop, platform, security, and operations architecture

## Context

Server Desktop and Server Headless are two delivery modes for one self-contained ACCORE Server instance. They intentionally share a durable data root, a stable server identity, and one Windows Service. Treating each installer as an independent service owner creates unsafe ambiguity: an update can leave the Service Control Manager pointing at an old Agent, and uninstalling one delivery mode can stop a server still being managed through the other.

The runtime also generates a Caddyfile dynamically. A malformed Caddyfile previously caused FrankenPHP to exit before binding the loopback API port; the Agent could identify the issue only after an HTTP readiness timeout. Production startup must validate generated configuration before launching a long-lived API process.

## Decision

### Machine-level server instance

The protected `%ProgramData%\ACCORE ERP\Server` root contains `server-instance.json` beside the private Agent configuration. The manifest records a stable instance identifier, stable server identifier, owning product mode, active runtime root, authorised Agent executable, service configuration path, schema version, and update timestamp. It is protected by the same ACL boundary as configuration, credentials, database files, backups, logs, and TLS material.

| Operation | Required behavior |
|---|---|
| Fresh Server Headless or Server Desktop installation | Claims an unowned machine-level instance, preserves durable identity if present, writes the manifest, and reconciles the Windows service. |
| Update by current owner | Rewrites the manifest with the active Agent and runtime, then stops, reconfigures, and starts the existing service. |
| Desktop install while Headless owns the instance | Attaches as a management console and starts the existing service if necessary; it does not replace the Headless owner. |
| Headless install while Desktop owns the instance | Fails with an explicit transition requirement. It must not implicitly take ownership. |
| Explicit transition | The authorised Agent preserves durable configuration and identities, writes the requested owner and runtime, then reconciles the service atomically. |
| Uninstall by non-owner | Removes only that delivery-mode package; it does not stop, unregister, or alter the service and customer data. |
| Uninstall by owner | Requests cooperative stop, unregisters the service, and preserves all durable customer data. |

### Windows Service reconciliation

For a service that already exists, Agent requests `CHANGE_CONFIG`, stops it in a bounded operation, applies a full `ServiceInfo` update containing the current Agent executable and `service --config` argument, then starts it. A fresh instance creates the same service configuration. Merely opening an existing service is not sufficient because it does not guarantee that SCM launches the active package runtime.

### Runtime preflight and public status

Before starting FrankenPHP, Agent invokes the embedded binary with Caddy `validate --config <generated-file> --adapter caddyfile`. Validation failure is terminal for that start attempt and publishes public runtime state `unhealthy`, phase `api-config-validation`, and error code `api_config_invalid`. It does not enter the generic HTTP recovery loop.

The public runtime status includes an explicit `phase` and optional non-secret `errorCode`. Bootstrap phases are `initializing`, `database-initialization`, `database-starting`, `migrations`, `seed-revisions`, `api-config-validation`, `api-starting`, `queue-starting`, and `ready`.

## Consequences

Both NSIS products must declare their product owner when they invoke Agent. Server Desktop is installed per-machine so its installer hooks have the administrative context required to register or attach to a Windows service. No product uninstaller may delete durable customer data.

CI acceptance validates the package hooks rather than manually invoking Agent after installation. It verifies the protected instance manifest and its correspondence to the SCM service executable, then verifies startup, protected backup, ordered removal, and durable identity continuity through reinstall. Focused ownership-transition acceptance follows the individual package contracts.

## References

1. [Caddy command-line reference — configuration validation](https://caddyserver.com/docs/command-line)
2. [windows-service crate — service lifecycle and configuration access](https://docs.rs/windows-service/0.8.1/windows_service/)
3. [ADR-009: Headless Server Deployment and First-Client Enrollment](ADR-009-headless-server-deployment-and-first-client-enrollment.md)
4. [ADR-010: Windows Server Product Lifecycle Acceptance Isolation](ADR-010-windows-server-product-lifecycle-acceptance.md)
