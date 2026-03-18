---
title: "ADR-005: Transaction Management & Idempotency"
domain: "cross-cutting"
subdomain: ""
tier: 2
status: approved
task_id: "ARCH-005"
template: "architecture-decision-record"
version: "1.0.0"
created: "2026-03-18"
last_updated: "2026-03-18"
word_count: 571
---

# ADR-005: Transaction Management & Idempotency

## Context

Financial ERP systems must guarantee that a monetary posting either completes fully or leaves the database in its prior state. Partial writes — where some ledger entries are persisted and others are not — corrupt the accounting record and violate double-entry integrity. An equally critical risk is duplicate posting: a network retry or a repeated user action that submits the same operation twice, resulting in phantom transactions that inflate account balances.

ACCSYSTEM processes financial operations across multiple domains — General Ledger, Accounts Receivable, Accounts Payable, Foreign Exchange, and Payroll — each of which may generate multiple database writes per business event. Without deliberate transaction boundary enforcement, these writes are vulnerable to partial failure and uncontrolled duplication.

## Decision

All mutating financial operations in ACCSYSTEM are wrapped in a database transaction boundary enforced by the `DB::transaction()` closure at the Action or Service layer. For ledger postings, idempotency is enforced through the `UniversalJournal` model using an `updateOrCreate` pattern keyed on the `voucher_number` field, which serves as the system-wide idempotency token.

Voucher numbers are generated within an isolated transaction: a temporary UUID-keyed record is created first to satisfy the unique constraint, then immediately updated to the zero-padded sequential number (`TYPE-000001`) derived from the auto-increment primary key. This guarantees uniqueness without an advisory lock or sequence table.

The `DocumentSequence` model acts as a format registry — storing the prefix, format pattern, and current counter per document type — but the authoritative sequence is driven by the `UniversalJournal` auto-increment identifier inside the transaction boundary.

## Rationale

The `DB::transaction()` pattern was chosen over application-layer saga orchestration because ACCSYSTEM operates on a single relational database. Atomic database transactions provide strong ACID guarantees at negligible overhead for the write volumes expected. Sagas introduce distributed state management complexity and are warranted only in multi-database, multi-service architectures.

The `voucher_number` was selected as the idempotency token because it is already mandatory for audit and regulatory compliance, it is unique per business operation, and it is generated inside the same transaction that posts the ledger entries. Re-submitting an existing voucher number triggers the `updateOrCreate` path, updating the journal header without inserting duplicate ledger lines.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Client-provided UUID idempotency header | Not present in the codebase; requires API contract changes and client-side key management overhead |
| Dedicated idempotency key table | Adds schema complexity without benefit over the existing unique constraint on `voucher_number` |
| Saga / Outbox pattern | Warranted only for distributed, multi-database systems; unnecessary for the current single-database topology |
| Optimistic locking with version columns | Not required for an insert-only ledger model; concurrent access is controlled by fiscal period locks |

## Consequences

**Positive:**
- Ledger posts are atomic — all entries succeed or none are persisted, preserving double-entry integrity
- Re-submission of an identical voucher number is absorbed without duplication
- Fiscal period lock and closure checks execute within the same transaction boundary, preventing posting to protected periods

**Negative:**
- Long-running transactions increase row-lock contention under high write concurrency
- The two-step UUID-then-update sequence for voucher generation introduces one additional write per numbering call

**Technical Debt:**
No explicit retry or backoff strategy was identified in the source code. <!-- [ASSUMPTION] --> It is assumed that transient database failures propagate as exceptions to the HTTP layer without automatic retry. This may require hardening before high-volume batch processing features are deployed to production.

## Status

`accepted`

## Related Decisions

- ADR-003: Action & Service Layer — defines the architectural layer responsible for transaction boundary placement
- ADR-004: Event Bus & Domain Events — domain events are dispatched after the enclosing transaction commits, not within it

## Assumptions & Open Questions

1. <!-- [ASSUMPTION] --> No automatic retry or exponential backoff strategy was found in source code. Current failure mode is assumed to be exception propagation to the HTTP boundary. **NEEDS_VERIFICATION** before production batch-processing deployment.
