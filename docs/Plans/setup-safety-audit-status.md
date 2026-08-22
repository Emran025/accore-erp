# Setup Safety Audit Status

## Scope and Decision

This record compares the user-supplied **Field and Relationship Safety Audit**—which reviewed `main` at `1f8d95629f00ed3155c806ecdf0d671b1b4a6007`—with `fix/server-desktop-bottom-notification-baseline` after the guided-setup refinements. It is a status record, not a claim that production remediation is complete.

> **Release gate:** the setup workflow must not be presented as safe for multi-organization production use until the two `P0` defects are closed and the affected `P1` contracts are covered by behavioral tests.

| Audit finding | Current-branch status | Evidence and disposition |
|---|---|---|
| `P0` — Node creation persists only one parent relationship | **Open** | The workspace still submits one `link` object, the request accepts one `link`, and `createNodeWithLink()` creates at most one relationship. The replacement must use an atomic `links[]` contract and validate all required rules before commit. |
| `P0` — Global `WH-MAIN` / `POS-MAIN` update path can overwrite another scope | **Partially mitigated; open** | The new setup and hierarchy flows select an existing POS terminal by ID and no longer seed those global default codes. The backward-compatible create path still uses `updateOrCreate` by `code`; it must be scoped or separated into an explicit, safely identified resource-creation flow. |
| `P1` — Metadata type, rule, default, and reference contracts are not enforced end-to-end | **Open** | The service checks mandatory presence plus a small set of hard-coded special cases. A shared metadata-driven normalizer and validator is required. |
| `P1` — Node update bypasses validation and financial-center synchronization | **Open; newly exposed by editable unit details** | The new setup action correctly uses the existing node-update endpoint, but that endpoint must first merge and validate attributes, then safely synchronize an affected center in the same transaction. Until repaired, direct in-setup edits remain a release blocker. |
| `P1` — Company-code country and plant constraints are inconsistent | **Open** | Country requirements and topology constraints need a unified policy and early error presentation. |
| `P1` — A GL-account row is used as a chart-of-accounts reference | **Open by design debt** | The guided UI clarifies the interim primary-ledger reference but cannot make a row-level account a proper chart header. A `charts_of_accounts` aggregate and scoped `chart_id` relation are required. |
| `P1` — Cost/profit-center synchronization bypasses relationship validation | **Open** | Synchronization must be routed through one relationship-aware transaction and require a resolved Controlling Area before activation. |
| `P1` — Expired required links can satisfy integrity checks | **Open** | The active-date filter is present in some operations but missing from the required-parent integrity check. |
| `P2` — Overlapping fiscal periods and unclear missing account-type feedback | **Open** | The guided UI hides completed embedded accounting setup, but overlap prevention and an explicit missing-type matrix remain required in the finance contract. |

## Safe Changes Already on This Branch

The branch improves the operator experience without claiming to close the underlying safety report: it refreshes readiness after successful saves, avoids forcing recreation of an embedded ledger baseline, replaces global-default POS entry in the primary setup flow with selection by existing ID, and separates the profit-center ownership of an organizational unit from the operating-link card.

## Required Remediation Order

1. Introduce `links[]` node creation with transaction-wide relationship validation and update the workspace to collect every required and optional relationship.
2. Remove code-only operating-resource mutation. Existing resources must be selected and updated by scoped IDs; any creation flow must generate scoped identities and enforce scope uniqueness.
3. Implement metadata-driven value normalization and validation, then route both create and update through it.
4. Make node updates relationship-aware and synchronize cost/profit centers only through the validated transaction.
5. Add a real chart-of-accounts header model, scoped fiscal-period constraints, and an explicit data-audit command before enabling production multi-organization onboarding.
