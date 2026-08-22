# ADR-010: Windows Server Product Lifecycle Acceptance Isolation

**Status:** Accepted for the 0.0.1 baseline

**Date:** 2026-08-22

**Decision owner:** Desktop, platform, security, and operations architecture

## Context

Server Desktop and Server Headless deliberately share one production Windows Service name, `ACCOREServerAgent`, and one protected durable root, `%ProgramData%\ACCORE ERP\Server`. This convergence is required for upgrades and for preserving the server identity, database, credentials, backups, logs, TLS material, and enrollment evidence. The Agent removes inherited access and grants full control only to `SYSTEM` and Administrators; the public runtime status is a separately read-only surface.

The former workflow ran an unpackaged Agent smoke test before the Headless installer acceptance in the same matrix job. It then tried to force-delete the protected production data root with `takeown`, `icacls`, and `Remove-Item`. That approach made the test outcome depend on the current process token and Windows ACL inheritance rather than on the product lifecycle. It also contradicted the product guarantee that ordinary uninstallation never deletes customer data.

> Acceptance tests must prove the production contract; they must not weaken or bypass it to create their own fixture state.

## Decision

Each Windows server product receives an independent lifecycle acceptance run after its signed NSIS installer has been built. The job starts only when the runner is pristine: there must be no ACCORE durable root, service registration, or managed runtime process. A non-pristine runner is a test-fixture failure, not a reason to modify protected data.

| Contract | Server Desktop acceptance | Server Headless acceptance |
|---|---|---|
| Installation artifact | Installs its NSIS package silently, then invokes its packaged Agent exactly as the GUI's elevated service action does | Installs its per-machine NSIS package silently, including the post-install Agent hook and response-file path |
| Readiness | Reads only redacted public status and requires the database, API, and queue to be ready | Uses the same public readiness contract and additionally rejects any headless desktop process |
| Removal | Invokes the packaged Agent's cooperative service removal, then invokes the product uninstaller | Invokes the NSIS uninstaller, whose pre-uninstall hook requests ordered removal |
| Durable-data proof | Reinstalls from the same package and requires the previously published public server identity to remain unchanged | Reinstalls from the same package and requires the same server identity; no private file or customer data is read or deleted |

The runtime status contract now includes the opaque `serverId`. This identifier is generated at initial installation, contains no credential, and is already part of the server trust model. It is suitable for proving durable identity continuity in the public status surface without exposing private configuration or inspecting protected database files.

### Bounded bootstrap contract

Initial Laravel migrations and versioned seed revisions are supervised by the Agent as a single bounded provisioning operation. Each operation has a five-minute execution window. A timeout, non-zero exit, or other provisioning error is terminal for that start attempt: the Agent writes an `unhealthy` public runtime state identifying the failed provisioning stage and exits rather than repeatedly restarting an unchanged migration or seed operation.

The lifecycle acceptance waits six minutes for a fresh installation. This is intentionally longer than the Agent contract so it can observe either a complete `ready` state or the Agent's explicit `unhealthy` state. It is not an unbounded test timeout and it never reads the protected configuration or durable data to diagnose a failure.

## Consequences

The pipeline no longer runs a pre-bundle smoke test that writes to the production durable root, and it no longer uses ownership takeover or ACL rewriting for test cleanup. A passing acceptance run verifies the packaged installer, service registration, embedded MariaDB and FrankenPHP readiness, ordered shutdown, unregistration, no-window Headless invariant, and data-preserving reinstall path.

The durable root intentionally remains after the final uninstallation in the ephemeral CI worker, exactly as it does for a customer installation. The worker is discarded by the hosted CI platform; production cleanup, if ever required, remains a separately designed and explicitly authorised administrative operation.

## References

[1] [ADR-004: Server Desktop Runtime and Durable Storage](ADR-004-server-desktop-runtime-and-storage.md)

[2] [ADR-006: Server Desktop Trust and Network Exposure](ADR-006-server-desktop-trust-and-network-exposure.md)

[3] [ADR-009: Headless Server Deployment and First-Client Enrollment](ADR-009-headless-server-deployment-and-first-client-enrollment.md)
