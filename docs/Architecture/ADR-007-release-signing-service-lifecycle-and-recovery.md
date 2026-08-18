# ADR-007: Release Signing, Server Lifecycle, and Recovery Authority

**Status:** Proposed
**Date:** 2026-08-18
**Decision owner:** Operations, security, and release engineering
**Related issues:** #38, #39, #43, #46, #52, #53, #54

## Context

A self-contained ERP distribution must update native desktop applications, API runtimes, and database-dependent schema safely. The current project has desktop build/release foundations but does not yet define a single operational authority for runtime updates, signing-key custody, service lifecycle, migration sequencing, or post-failure recovery.[1] Laravel’s development commands are not a production supervisor and should not determine database or queue availability.[2]

The system must preserve organisation data if a release download, runtime activation, migration, or health check fails. It must also remain available to LAN/Internet clients when a Server Desktop user closes the UI.

## Decision

The **Accore Server Agent** is the sole operational authority for server service lifecycle and schema-affecting release execution. Server Desktop may display status and request an authenticated administrative action, but it does not own database/API processes.

| Event | Required Agent behaviour |
|---|---|
| Operating-system boot | Start AccoreDB, await readiness, start API runtime and queue worker, then publish health. |
| Server Desktop launch | Query local Agent status and wait for healthy local API before showing protected ERP routes. |
| Server Desktop close | Keep Agent, database, API, and queue running by default. |
| API failure | Collect diagnostics and apply bounded restart/backoff without stopping AccoreDB. |
| Database failure | Stop dependent API serving, expose unhealthy state, and apply bounded recovery according to runbook. |
| Planned maintenance | Enter maintenance, safely stop/drain queue work, then perform requested maintenance in dependency order. |
| Administrative shutdown | Stop queue work, API runtime, then database; record a lifecycle audit event. |

All distributable artifacts are signed. A release manifest lists source revision, product flavour, version, platform, architecture, digest, compatibility, and artifact signature. The public verification key is included in relevant client/installer configuration; private release keys are stored only in an approved secret manager or protected CI release environment and are never committed to the repository. Tauri updater artifacts use the required signed-update mechanism.[3]

For a Server release, the Agent performs this state machine:

1. Download/import verified artifacts into staging.
2. Validate signature, digest, release compatibility, free space, current service health, and migration lock availability.
3. Create and record a consistent database backup checkpoint.
4. Enter maintenance mode.
5. Run the single locked upgrade/migration operation.
6. Start the staged runtime and execute health checks.
7. Atomically activate the new runtime only after success; otherwise preserve maintenance and recovery evidence.

## Consequences

Server Desktop closure never implicitly kills organisation services. A single-workstation auto-stop mode may be introduced only as an explicit, administrator-enabled policy after operational review. It cannot be the default in any deployment where other clients can connect.

A failed release before migration returns to the prior verified runtime after a health check. A failure after migration does not assume that a generic migration rollback restores financial/business data. The system remains in a clear maintenance/recovery state and uses the documented backup restoration procedure. Every outcome is captured in `release_ledger` with release digest, source/target schema, backup reference, time, result, and initiating identity.

## Alternatives considered

| Alternative | Decision | Reason |
|---|---|---|
| Let Server Desktop start/stop all child processes | Rejected | UI closure, crashes, and user sessions become a single point of operational failure. |
| Update the API in place without staging or backup | Rejected | Cannot provide reliable recovery from an interrupted or incompatible migration. |
| Store signing keys in repository secrets/configuration files | Rejected | Increases compromise risk and makes key rotation/audit weak. |
| Allow every Client to update the Server/schema | Rejected | Breaks central operational authority and can cause concurrent migrations. |

## Approval and review record

Release Engineering, Security, Backend Architecture, Desktop Architecture, and Operations must approve signing-key custody, retention, recovery point objective, recovery time objective, restart budget, maintenance behaviour, and emergency restore authority. This decision is not fully accepted until the operational runbook and clean-device recovery tests in #53 and #54 provide evidence.

## References

[1]: https://github.com/Emran025/accore-erp/tree/8ddbe38ac0e4629254909319e7c1d9613a9a5325/.github/workflows "Current CI and desktop release foundations"
[2]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/backend/composer.json "Current development process commands"
[3]: https://v2.tauri.app/plugin/updater/ "Tauri signed updater documentation"
