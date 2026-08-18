---
title: "Accore Server Operations, Recovery, and Support Runbook"
domain: "Operations"
status: "active"
version: "1.0.0"
last_updated: "2026-08-19"
---

# Accore Server Operations, Recovery, and Support Runbook

## Purpose and operating boundary

This runbook governs the **self-contained Accore Server** installation. Operations are performed from the local Server Desktop or its protected local management channel; no lifecycle, backup, or diagnostics action is exposed through a remote control port. An operator should first use the status surface, which identifies the affected component and a recommended action, rather than collecting raw logs.

The authoritative operational health model covers **Agent, database, API, queue, durable storage, backup, schema, and Client compatibility**. A failed state blocks normal ERP service where continuing would risk integrity. An attention state permits only the explicitly safe operation documented below.

| Component | Healthy evidence | Failed/attention signal | Default recommended action |
| --- | --- | --- | --- |
| Agent | Local supervisor responds through its protected endpoint | Lifecycle command fails or restart budget is exhausted | Restart only through the local Server Desktop; export a support bundle before escalation. |
| Database | Loopback AccoreDB is ready and API dependency check passes | Database readiness fails or data integrity probe fails | Put Server in maintenance, retain the latest backup, and follow the restore procedure. |
| API | Local `/up` health endpoint responds successfully | API runtime is unavailable | Inspect disk capacity and the Server support bundle, then restart the API through the Agent. |
| Queue | Queue drains and starts after API readiness | Drain or worker readiness fails | Drain safely, restart the queue, and retain lifecycle audit evidence. |
| Storage | Durable data, backups, and validation roots remain separate from runtime binaries | Low disk capacity, unsafe path, or failed write | Stop updates, free capacity or move data under an approved maintenance change, then verify ownership and permissions. |
| Backup | Latest backup has a successful isolated restore verification | Backup missing, stale, or restore verification fails | Do not rotate the implicated backup; run the restore verification procedure and escalate. |
| Schema | Migration completes under maintenance after a backup checkpoint | Migration/health failure after schema change | Follow the update-recovery procedure; do not declare the release healthy. |
| Client compatibility | Bootstrap and policy report `compatible` | `update_required`, certificate mismatch, or revoked device | Publish/approve the required Client release or repair the trust/pairing condition. |

## Standard evidence and support bundle export

**Preconditions.** Confirm that the request originates from a local administrator or the Server Desktop. Record the ticket or incident reference without pasting customer data, credentials, access tokens, database connection strings, `APP_KEY`, or signing keys.

**Action.** Export a Server support bundle to the approved support directory. The bundle is generated atomically and redacts credentials, bearer tokens, database URLs, `APP_KEY`, private signing material, and secret-style key/value lines. Include the resulting file name and hash in the incident record; do not attach raw runtime logs in place of the bundle.

**Verification.** Inspect the bundle only for safe health summaries, release ledger stages, and operational audit references. Confirm that no literal `APP_KEY`, password, token, `Authorization` bearer value, private key, or database URL appears.

**Rollback or escalation.** If redaction is uncertain, do not transfer the artifact. Delete the exported bundle from the hand-off location, record a failed support-export event, and escalate to security operations.

**Audit expectation.** Record a `support_bundle` event with outcome, timestamp, and safe incident reference. Never use raw log text as the audit context.

## Backup and isolated restore verification

**Preconditions.** Ensure the Server reports database and storage health. Verify that `backup_root` and `validation_root` are durable paths outside runtime binaries, with enough capacity for a full restore. The validation root must not be a production data directory and must not be network exposed.

**Action.** Create a logical backup through the packaged database runtime. Immediately restore it into the isolated validation root, run the integrity probe, and clean the validation environment. Scheduled jobs and administrator-initiated runs follow the same sequence.

**Verification.** Mark a backup verified only after export, isolated restore, integrity probe, and cleanup all succeed. A restore verification failure must leave `verified_at` unset and emit a failed `restore_verification` audit event.

**Rollback or escalation.** Retain both the backup and validation evidence. Do not rotate the backup that failed verification. Open an incident, run a second isolated verification only after correcting the environment cause, and escalate if the failure repeats.

**Audit expectation.** Record `backup` and `restore_verification` events using a safe backup identifier only. Store backup size and timestamp; never store database credentials or SQL output in the event.

## Retention and log/event rotation

The default retention policy preserves at least the **14 newest backups** and retains backup data for **30 days**. A candidate is removable only when it is both older than the retention window and outside the newest protected set. Restore verification is due at least every **7 days**, or immediately for an unverified backup. Failed or unverified backups are not silently deleted.

Operational event logs use the same durable, append-only audit model. Rotate exported support bundles and local diagnostic files on the approved retention schedule, retaining incident-linked evidence until the incident closure policy permits deletion. Rotation must record a `retention` audit event with a safe artifact reference and outcome.

## Server restart and API runtime failure

**Preconditions.** Capture the visible failed component, recommended action, and support bundle reference. Confirm that no migration or backup restore is in progress.

**Action.** Use the Agent to start in dependency order: database, API, then queue. For an API-only unexpected exit, the Agent may use its bounded restart policy while retaining the database. Do not manually start a dependency out of order.

**Verification.** Confirm database, API, and queue report ready; confirm `/up` succeeds; then verify the Server Desktop permits protected routes.

**Rollback or escalation.** If the API restart budget is exhausted, leave the state degraded, preserve the support bundle, and escalate. If the database fails, stop API and queue before further investigation.

**Audit expectation.** Record a `lifecycle` event for the restart attempt and its final outcome.

## Disk capacity and storage-path failure

**Preconditions.** Stop pending release activation and backup rotation. Preserve a current support bundle and record the reported storage component state.

**Action.** Identify capacity pressure only through approved operational diagnostics. Free space from approved transient artifacts first; do not delete durable data, backups, or validation evidence outside retention policy. Verify that runtime, durable data, backup, and validation paths remain separate.

**Verification.** Re-run storage and database readiness, then execute a small isolated backup verification before resuming updates.

**Rollback or escalation.** If safe capacity cannot be restored, keep the Server in maintenance and escalate to infrastructure operations. Do not run migrations while storage health is degraded.

**Audit expectation.** Record the safe storage reference, action outcome, and validation result in a `lifecycle` or `backup` event as applicable.

## Certificate and Client pairing failure

**Preconditions.** Capture the pairing error category: certificate mismatch, identity mismatch, revoked device, or update required. Do not collect enrollment evidence or device tokens in a ticket.

**Action.** Compare only public server identity and certificate fingerprint values provided by the approved pairing artifact. For a revoked device, issue new enrollment evidence through the administrator workflow. For `update_required`, publish or install the compatible Client release before re-enrollment.

**Verification.** Bootstrap must report healthy status and the expected API contract; policy must report `compatible` for the paired device. Confirm that the Client stores credentials only in its protected vault.

**Rollback or escalation.** Revoke mistakenly issued enrollment evidence or devices, record the reason, and escalate any unexpected certificate change as a security incident.

**Audit expectation.** Record `pairing` events with device identifier and public outcome only; never include enrollment evidence or device access tokens.

## Release update failure and recovery maintenance

**Preconditions.** A signed manifest and exact artifact digest have already passed verification. Confirm a recent verified backup exists before migration.

**Action.** Follow the release ledger sequence: stage, preflight, backup, maintenance, migration, activation, health, then leave maintenance.

**Verification.** Report the release healthy only after post-activation health succeeds and maintenance is cleared. The ledger must show the backup checkpoint before migration.

**Rollback or escalation.** For a pre-migration failure, reactivate the prior healthy runtime and record `rolled_back`. For migration, activation, health, or maintenance-clear failure after migration, enter recovery maintenance and record `recovery_required`; do not claim success or resume normal ERP traffic until recovery is completed.

**Audit expectation.** Preserve the release version, immutable source revision, state transition, timestamp, and safe detail in the release ledger.

## Production restore procedure

**Preconditions.** Obtain incident authority, select the latest **verified** backup, place Server in maintenance, stop queue and API safely, and preserve all relevant support, backup, and release-ledger evidence.

**Action.** Restore only through the packaged database runtime into the approved durable data root. Apply any approved point-in-time recovery procedure outside the application runtime. Do not copy a validation directory over production data.

**Verification.** Start database, API, and queue in order; run integrity and schema checks; confirm `/up`, desktop bootstrap health, and Client compatibility before clearing maintenance.

**Rollback or escalation.** If integrity or schema checks fail, return to maintenance and escalate to database recovery specialists. Do not retry a destructive restore without preserving a new incident checkpoint.

**Audit expectation.** Record backup identifier, restore outcome, verification result, actor, incident reference, and maintenance transition without credentials or customer records.

## Escalation matrix

| Condition | Escalate to | Required evidence |
| --- | --- | --- |
| Repeated restore verification failure | Database recovery owner | Safe support bundle, backup identifier, validation failure outcome, retention state. |
| Unexpected certificate or server-identity change | Security owner | Public fingerprint comparison, pairing audit outcome, affected device identifiers. |
| Post-migration recovery maintenance | Release owner and database owner | Release ledger, verified backup identifier, safe health report. |
| Disk/storage path cannot be repaired safely | Infrastructure owner | Storage health report, capacity evidence, maintenance state. |
| Redaction uncertainty or suspected secret exposure | Security owner | Artifact name/hash only; do not transmit the unverified artifact. |
