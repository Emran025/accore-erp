# ADR-008: Server Desktop Operational Continuity, Backup, and Update Activation

**Status:** Accepted

**Date:** 2026-08-20

**Decision owner:** Distribution, release, and operations architecture

## Context

ACCORE ERP Server Desktop stores financial and operational records locally. Its embedded MariaDB service, Laravel application, and durable storage make a successful installation insufficient on its own: the product must create recoverable restore points, prove that restore material is usable, retain evidence of operational outcomes, and apply signed product updates without treating customer data as an installer payload.

The existing service already owns runtime lifecycle, durable storage ACLs, readiness publication, and controlled stop requests. The existing distribution pipeline signs Tauri updater artifacts. Neither capability, by itself, establishes an auditable backup chain or a versioned runtime-package activation and rollback mechanism.

## Decision

The Windows Service is the sole authority for scheduled backup, restore validation, retention, and durable operational audit records. The desktop window may request a backup through an elevated Agent command and may display only redacted operational status. It must never receive database credentials, direct write access to the backup store, or the authority to delete a restore point.

The first operational release uses a logical MariaDB backup generated from the embedded `mariadb-dump.exe` utility, written to an Agent-controlled temporary file, gzip-compressed, digested with SHA-256, and atomically promoted into `%ProgramData%\ACCORE ERP\Server\backups`. Every successful backup is recorded in an atomic JSON manifest. The public status directory contains a redacted snapshot that is safe for the desktop UI to read. Audit history remains in the protected data root and records event type, timestamp, safe reference, and outcome only.

Every new backup must complete an isolated restore verification before it is marked verified. The verification instance uses a separate temporary data directory, a dedicated loopback port, and never opens the production database directory. It starts a second embedded MariaDB process, restores the gzip archive, checks that the expected database exists and accepts a basic query, and then terminates the validation instance and removes its temporary directory. A failed verification retains the backup for investigation but publishes an attention state and prevents it from being reported as a verified restore point.

Scheduled creation occurs every six hours after the local server becomes ready, with an immediate first backup when no restore point exists. Retention keeps at least the newest fourteen restore points and removes only backups that are both outside that minimum and older than thirty days. Verification is required for each newly created backup and again after seven days. Retention runs only after the manifest has been durably updated following a successful backup cycle; it never deletes the only or newest restore point.

Server Desktop product updates remain signed Tauri updater artifacts in this release. The desktop may check for a signed update and present version metadata, but it must not install an update while the local server is unhealthy. Before handoff to the Tauri installer, the desktop requests the Agent's ordered service shutdown and waits for the public status to report `stopped`. The installer update contains a complete, signed desktop distribution including the embedded Agent and runtime resources. Customer databases, Laravel storage, secrets, backups, status, and audit records remain under `%ProgramData%` and are excluded from the updater payload.

The `accorepkg` model specified in ADR-007 remains the mandatory target for independent runtime-package staging, activation health gates, and automatic executable rollback. It is deliberately not represented as complete until the release pipeline emits signed runtime packages, the Agent has a versioned cache and active-runtime pointer, and automated tests prove rollback after a failed activation. Until then, Server Desktop must truthfully present signed installer updates as an administrator-approved update flow, not as autonomous runtime-package rollback.

## Operational Invariants

| Area | Required invariant |
|---|---|
| Customer data | Database files, secrets, Laravel storage, backups, and audit history never reside in the immutable runtime or Tauri updater payload. |
| Access control | Only `SYSTEM` and local administrators can modify protected data, control signals, backup archives, manifests, or audit history. A standard desktop user receives redacted status only. |
| Backup atomicity | A backup becomes eligible for retention or UI display only after its compressed artifact, digest, and manifest record have been atomically published. |
| Restore isolation | Restore validation never shares a data directory, port, or production credentials file with the live database. |
| Retention safety | A failed capture or verification never triggers deletion of an existing restore point. The retention rule cannot remove the newest fourteen points. |
| Update safety | Update installation is blocked when health is not ready, and the Agent is stopped in a controlled order before Tauri replaces executable resources. |
| Audit safety | Audit entries contain no credentials, SQL text, raw command lines, customer records, or unrestricted logs. |

## Consequences

The Agent must implement a Windows MariaDB backup adapter, catalog persistence, protected audit writing, control-file consumption, isolated restore validation, and schedule integration. The desktop bridge must expose read-only backup status and a privileged backup request path. The updater client must be explicitly wired to check signed metadata and must stop the service before installer handoff.

The release workflow must demonstrate a backup artifact and manifest during the Windows smoke test. It must also keep the existing cold-start, privilege, readiness, and ordered-shutdown evidence. Runtime-package staging, activation, and rollback remain a separate release gate and cannot be asserted by a Tauri installer-only test.

## Validation

The implementation is accepted only when automated checks demonstrate all of the following:

| Scenario | Evidence required |
|---|---|
| First ready state | An immediate backup request produces a non-empty gzip artifact, a checksum, a protected manifest record, a redacted status snapshot, and safe audit entries. |
| Restore validation | A backup restores into an isolated database instance, accepts a health query, and leaves neither a running validation process nor a temporary directory. |
| Failure behavior | A deliberately invalid artifact is retained but never marked verified; existing restore points are not pruned. |
| Retention | Records outside the fourteen-point, thirty-day policy are removed only after a successful manifest update and never include protected recent points. |
| Update handoff | A signed update is discoverable; installation refuses an unhealthy server and performs an ordered service stop before handing control to the signed Tauri installer. |
| Deferred package rollback | `accorepkg` activation and rollback are not reported as delivered until a versioned cache, signature verification, activation probe, rollback pointer, and failure-injection test exist. |
