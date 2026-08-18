# Accore Server Lifecycle and Recovery Policy

**Status:** Proposed
**Date:** 2026-08-18
**Policy owner:** Operations
**Related ADRs:** ADR-004, ADR-005, ADR-006, ADR-007
**Related issues:** #38, #39, #43, #44, #46, #52, #53, #54

## Purpose

This policy translates the Accore Server distribution decisions into an operational contract. It specifies which process owns each runtime component, which events must be recorded, when customers may access ERP, and how operators recover from a failed installation, service failure, or release failure without treating mutable ERP data as disposable application files.

## Scope and applicability

The policy applies to Accore Server installations on the primary machine in local-only, LAN, and Internet-enabled modes. It applies to the Server Agent, AccoreDB, API runtime, queue worker, Server Desktop, installer, update system, backups, and support diagnostics. It does not define general offline-first client data synchronisation or direct client database access.

## Operational ownership

| Component | Owner | Required state before ERP access | Prohibited responsibility |
|---|---|---|---|
| Accore Server Agent | Dedicated OS service account | Running and able to report authenticated local status | Exposing arbitrary command execution to UI/users |
| AccoreDB | Server Agent | Ready on loopback; integrity/space checks pass | Listening on LAN/Internet or being stopped by Client |
| Accore API runtime | Server Agent | Bootstrap and application health checks pass | Using developer `artisan serve` lifecycle in production |
| Queue worker | Server Agent | Compatible runtime and required database structures available | Silent loss of failed jobs/queue diagnostics |
| Server Desktop | Authenticated desktop user | Agent and API are healthy | Owning database/API process lifetime |
| Client Desktop | Paired end user | Trusted HTTPS server profile and policy check pass | Direct database connection or server administration |

## Normal lifecycle

At operating-system boot, the Agent starts AccoreDB and waits for a bounded readiness period. It starts API runtime only after database readiness succeeds and starts queue processing only after API/runtime compatibility checks pass. The Agent publishes component state, versions, last successful backup, storage status, and current release information to the protected local management channel.

Server Desktop reads this status on launch. If the server is starting or unhealthy, it displays an explicit readiness or recovery state rather than opening a partially usable ERP workspace. Closing Server Desktop is not a server shutdown event. The Agent, database, API, and queue remain active so authorised clients retain access.

## Health and access gates

| State | Minimum evidence | User-facing behaviour | Operator action |
|---|---|---|---|
| `starting` | Agent active; dependency startup in progress | Server UI shows progress; clients receive retryable unavailability | Wait within bounded timeout; inspect diagnostics if exceeded |
| `healthy` | Database ready, API bootstrap succeeds, queue compatible, storage threshold met | Server and paired Client ERP access allowed | Continue monitoring |
| `degraded` | Non-critical issue such as backup-age warning or recoverable queue delay | Access permitted with operator warning | Investigate before threshold breach |
| `maintenance` | Planned release/recovery state | New ERP work blocked or maintenance screen shown | Complete controlled operation or restore |
| `unhealthy` | Database/API integrity or dependency failure | Protected ERP access blocked; no stale data is represented as current | Run documented recovery and collect support bundle |

No Client access decision is based only on cached UI authentication state. Client startup must verify the paired server profile and policy according to ADR-006.

## Backup and recovery policy

Before schema-changing releases, database-runtime upgrades, or destructive administrator-requested recovery, the Agent creates a consistent backup checkpoint. The release ledger records release version/digest, database runtime version, schema before/after, checkpoint location, timestamps, and result. Backup artefacts are encrypted and retained according to the approved retention policy. Backup correctness is demonstrated periodically by restoring to an isolated validation location; a successful backup command alone is not considered proof of recoverability.

A pre-migration release failure restores the prior verified application runtime after health checks. A post-migration failure enters maintenance mode and requires the documented restore procedure. The operator must not rely on migration rollback as a guarantee that financial/business data has been restored.

## Failure handling

| Incident | Immediate containment | Recovery authority | Required evidence before reopening access |
|---|---|---|---|
| Installer interruption | Preserve journal and verified cache; do not remove data directory | Installer under authorised administrator | Resume/rollback decision completed; component health passes |
| API runtime failure | Retain database; collect logs; bounded restart | Server Agent | API bootstrap and health pass |
| Database failure | Stop dependent API serving; preserve diagnostics | Server Agent and Operations | Database integrity/readiness and API health pass |
| Queue failure | Stop/restart worker according to bounded policy; retain job diagnostics | Server Agent | Worker healthy and failed-job policy executed |
| Failed pre-migration update | Re-activate previous runtime | Server Agent | Prior runtime health passes; ledger failure recorded |
| Failed post-migration update | Remain in maintenance; protect data and checkpoint | Operations restore authority | Restore validation and application health pass |
| Certificate/trust failure | Deny Client connection; do not offer bypass | Server administrator/Security | New approved trust material and successful pairing check |

## Compliance and audit

The system records installation, first organisation setup, service lifecycle actions, pairing-code generation, device enrolment/revocation, backup, update, migration, maintenance, and recovery events. Support bundles include version metadata, redacted configuration diagnostics, component health, and relevant log windows. They must not contain database passwords, `APP_KEY`, private release keys, private TLS keys, refresh tokens, or user access tokens.

## Assumptions and open approval items

The final AccoreDB distribution/licensing choice, initial supported OS scope, certificate strategy, secret-manager/key-custody provider, backup retention, recovery objectives, and release channels remain proposed until the owners listed in ADR-004 through ADR-007 approve them. No production customer deployment is certified until the clean-device installation and recovery acceptance suite has evidence for the supported platform.
