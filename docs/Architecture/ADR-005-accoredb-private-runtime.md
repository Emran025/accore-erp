# ADR-005: Private AccoreDB Runtime, Data Boundary, and Upgrade Policy

**Status:** Proposed
**Date:** 2026-08-18
**Decision owner:** Backend architecture and operations
**Related issues:** #38, #39, #44, #45, #46, #53

## Context

Laravel currently targets a MySQL database through ordinary environment variables, with database-backed cache, sessions, and queues in the example configuration.[1] This creates an external prerequisite in the current development model. A self-contained Server product needs a database runtime that can be installed, upgraded, backed up, and recovered without relying on a machine-wide MySQL configuration or on a user-managed database administrator account.

The database stores authoritative ERP records. It must continue operating when Server Desktop is closed, must be unavailable to untrusted clients, and must remain recoverable when an application/runtime update fails.

## Decision

Accore Server will ship a vetted, **MySQL-compatible private database runtime** named **AccoreDB**. The exact upstream distribution and licensing evidence are a release prerequisite recorded in the associated procurement/license review. AccoreDB runs only under the Accore Server Agent and is not a general-purpose, user-administered database installation.

| Concern | Decision |
|---|---|
| Network exposure | Bind AccoreDB to loopback only. No LAN or Internet database port is opened. |
| Data location | Persist data at `${ACCORERUNTIME_HOME}/data/database/`, outside application binaries and versioned runtime directories. |
| Process ownership | Server Agent owns start, readiness, bounded restart, graceful stop, backup coordination, and upgrade. |
| Credentials | Setup generates a random service secret and dedicated least-privilege Accore database account. No production use of `root`. |
| Client access | Clients communicate through HTTPS API only; no client receives database credentials. |
| Backups | A consistent backup checkpoint is required before schema-changing release migrations or database-runtime upgrades. |
| Upgrade | Runtime binaries are staged beside the current version; data format compatibility is checked before activation. |

The server account is granted only the privileges required by the committed Laravel application and migration path. Administrative database operations are executed through the Agent’s restricted service identity and documented recovery procedures, not exposed from Server Desktop as an arbitrary SQL console.

## Consequences

The distribution pipeline must build or acquire an OS/architecture-specific AccoreDB artifact and attach license notices, version metadata, checksums, upgrade compatibility information, and restore-test evidence. The Server Agent must provide database readiness and health states to the installer and Server Desktop.

The application no longer assumes `DB_USERNAME=root`, even though the current example environment uses it.[1] Installation generates protected configuration readable only by the Accore service identity. The resulting data directory cannot be removed by normal Client or Desktop uninstall actions.

## Alternatives considered

| Alternative | Decision | Reason |
|---|---|---|
| Require customer-managed MySQL | Rejected | Introduces environmental and support variance and defeats the self-contained Server requirement. |
| Embed a database process directly in Tauri Desktop | Rejected | Ties data availability to a UI process and prevents reliable service supervision. |
| Expose AccoreDB to LAN clients | Rejected | Bypasses API authentication, authorisation, audit, and business invariants. |
| Use SQLite as a transparent replacement | Rejected | Changes Laravel operational assumptions and does not meet the existing MySQL-compatible backend contract without a separate migration initiative. |

## Backup, restore, and rollback policy

A runtime release is not an implicit data rollback. Before a migration, the Agent records the current release, schema version, database runtime version, and backup location in a release ledger. A failed pre-migration release reactivates the previous runtime after a health check. A failure after schema migration remains in maintenance until recovery is completed using the documented backup restore procedure; `migrate:rollback` is not treated as proof of business-data recovery.

Backups must be validated through restoration into an isolated validation location. The initial release policy defines retention, encryption at rest, off-host copy, recovery point objective, and recovery time objective before production deployment.

## Approval and review record

The final database distribution, version, license, patch process, data-format upgrade policy, backup tool, and supported restore procedure require Backend Architecture, Security, Operations, and Legal/Procurement approval. The approval evidence is attached to #39 and referenced by #44 release artifacts.

## References

[1]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/backend/.env.example "Current database configuration"
[2]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/docs/Operations/Database_Backup_And_Recovery_Policies.md "Existing backup and recovery policy"
