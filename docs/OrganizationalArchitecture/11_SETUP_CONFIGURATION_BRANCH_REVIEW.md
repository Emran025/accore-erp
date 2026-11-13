# DOCUMENT 11 — Setup Configuration Branch Review & Delivery Plan

**Repository:** ACCORE ERP  
**Reviewed branch:** `update-application-config`  
**Reviewed against:** `main` at `d905c68`  
**Branch tip reviewed:** `60cc189`  
**Review date:** 2026-11-13  
**Purpose:** Reconcile the proposed setup/configuration improvements with the implementation that actually exists on the branch, identify remaining delivery gaps, and provide issue-ready scope and acceptance criteria.

---

## 1. Executive Finding

The branch is a substantial organization-governance and guided-setup implementation, not yet evidence of a certified, end-to-end financial configuration or retail-first-sale solution. It adds organization blueprints and lifecycle actions, inference and adaptive questions, graph/closure and temporal-link services, organization perspectives, setup/Studio UI components, and a standard chart-of-accounts action. These are meaningful foundations.

The attached SAP-inspired proposal should therefore be treated as a **target architecture and gap-analysis input**, not a description of what this branch already does or a committed scope for a single issue. Its highest-value next step is to harden and certify the current organization setup path, then separately scope financial configuration/readiness and retail transaction proof. Do not claim that a capability is complete based solely on a service, route, UI component, migration, or seeded data being present.

### Recommended delivery order

1. **P0 — Establish a reproducible, safe setup lifecycle:** verify draft/stage/validate/publish behavior, graph invariants, tenant/company scope, idempotency, and recovery with automated tests.
2. **P1 — Close configuration-to-operations gaps:** verify explicit and consistent operational-resource bindings and server-authoritative readiness; avoid inferred or hidden relationships that cannot be reviewed or repaired.
3. **P1 — Define finance readiness as a separate domain contract:** chart aggregate, posting-role mapping, fiscal calendar generation, and period integrity require implementation and tests before any retail-ready claim.
4. **P2 — Align guided UI with actual API contracts:** schema/metadata-driven inputs and server-derived preview/readiness must be supported by endpoints and wired in the UI; do not require a bespoke canvas redesign as a prerequisite for correctness.
5. **P3 — Certify a vertical slice:** clean install through setup, operational context, and a posted retail sale with ledger evidence, plus service-only exemption and localization/accessibility checks.

---

## 2. Branch Reality Check

The review is based on the code and tests in the branch, not on historical local paths from the supplied draft. Those `file:///c:/...` references are machine-specific and must not be used as repository links.

### Present in the branch (verify behavior, not just file presence)

- Organization blueprint persistence and lifecycle operations (stage, validate, publish), supported by `BlueprintCompiler` and lifecycle actions/controllers.
- Inference analysis, signal extraction/scoring, synthesized blueprints, and adaptive-question APIs.
- Organization graph-related additions, including closure maintenance, perspectives, structural links, and effective-dating service.
- Setup and Organization Studio UI additions, including adaptive questions and blueprint review components.
- Standard chart-of-accounts provisioning action/service and changes to the chart seeder/controller.
- Tests changed or added for chart-of-accounts API behavior.

These items do **not by themselves prove** that blueprint publication is idempotent under retries, that all graph writes are atomic across every dependent resource, that resource scope is isolated in every API path, that finance-role validation is enforced during sales posting, or that the UI readiness state is authoritative.

### Not established by this branch review as complete

- A complete retail posting-role mapping contract enforced by the sales/ledger posting path.
- A true, company-bound chart aggregate lifecycle with validated active postable leaf-role assignments across required business capabilities.
- A server-side fiscal period generator covering supported calendar variants, with database-enforced no-overlap guarantees.
- Explicit end-to-end warehouse/POS/store/company binding with actionable repair and readiness evidence.
- A setup preview contract that drives all frontend schemas, localization choices, and reason-coded readiness states.
- A clean-database end-to-end test proving setup culminates in a legally valid first retail sale.

Before converting any item above into a “missing” or “done” assertion, assign a test or code reference in the implementation issue. Scope-dependent roles (for example, `AP_TRADE` for purchasing or `AR_TRADE` for credit sales) must be computed from selected capabilities and payment scenarios; never make every role universally mandatory for a cash-only retail recipe.

---

## 3. Architecture Decisions and Corrections to the Proposal

1. **Organization blueprint is not the finance configuration package.** Keep organization graph lifecycle and finance configuration as related but separately versioned contracts with explicit integration points.
2. **“Zero hardcoding” means no policy or readiness guess in the client.** The browser may render known UI components, but country, currency, calendar, node types, permitted options, required fields, and capability requirements must come from versioned server metadata. The server remains authoritative for validation and activation.
3. **Use server preview as the source of truth.** Local state may update immediately for responsiveness, but it must be visibly pending and must not show “ready/certified” until a matching server response validates the current draft revision. Reject stale responses by revision/request identity.
4. **Make apply/publish semantics explicit.** Define whether publication is all-or-nothing; if it provisions dependent operational records, the transaction boundary, retry key, duplicate behavior, and compensation/recovery behavior must be tested. Never imply global atomicity where external systems or separate transactions are involved.
5. **Avoid database-specific guarantees without a supported-engine decision.** Date-range exclusion mechanisms differ across MariaDB/MySQL and PostgreSQL. State the supported database engines and implement a portable transactional overlap check plus appropriate indexes/locking, or document an engine-specific constraint and migration strategy.
6. **Treat localization claims as configuration, not legal certification.** Currency and locale metadata do not certify statutory tax treatment, e-invoicing, or legal validity. Tax engines/localization packs require separately reviewed requirements, versioning, and jurisdiction-specific tests.
7. **Prefer milestones over estimated dates.** The supplied Gantt dates and week estimates are unverified. Track dependency-based deliverables and evidence in issues instead of retaining speculative day-level commitments.
8. **Reuse the existing organizational architecture specification.** This review supplements Documents 01–10; it does not supersede their domain model. Resolve inconsistencies by recording a decision in the relevant issue and updating the canonical contract.

---

## 4. Implementation Work Packages

### WP1 — Safe organization blueprint lifecycle

**Scope:** blueprint draft revisioning; validation and publish state transitions; graph integrity; valid relationship planes/types; cycle rules where applicable; company/tenant scoping; audit history; retry/idempotency; conflict handling for concurrent edits; rollback/recovery.

**Required evidence:** feature tests covering valid and invalid graph cases, retrying the same publish request, concurrent modification, cross-company access denial, failed publish without orphan nodes, and preserving historical links during effective-dated changes.

### WP2 — Operational configuration binding

**Scope:** explicitly represent and validate company/legal entity, operating site, warehouse, POS terminal, and applicable cost/profit dimensions. Ensure each ID is active, authorized, in the same company scope, and attached according to the selected recipe. Return stable reason codes and repairable field/resource references.

**Required evidence:** tests for valid retail bindings, detached/inactive warehouse, POS-to-different-store mismatch, cross-company IDs, missing dimensions where required, and non-retail recipes that do not require stock/POS resources.

### WP3 — Finance foundation and readiness

**Scope:** decide and implement chart aggregate ownership and lifecycle; package/version model; active postable leaf-account rules; role mappings derived from enabled capabilities and transaction scenarios; fiscal calendar variants and period generation; opening balances/history policy; posting-period overlap and transaction-date validation.

**Minimum role model for a first retail proof:** define actual payment/tax/sales assumptions first. Candidate roles may include cash/till clearing, sales revenue, inventory asset and COGS for inventory-tracked sales, and output tax where applicable. AR is required only for credit/customer-ledger scenarios; AP only when purchasing is enabled. Role keys and account types must be validated against the approved chart package, not copied blindly from illustrative sample account codes.

**Required evidence:** role-mapping tests for missing, inactive, summary, wrong-type and cross-company accounts; calendar tests for leap years and supported variants; overlap, gap and closed-period tests; transaction-level posting tests.

### WP4 — Reactive guided setup and metadata contract

**Scope:** document and version metadata/preview API schemas; provide localized choices and constraints from the backend; attach each preview/readiness response to a draft revision; present loading, stale, blocked, warning, ready, and error states distinctly; expose actionable remediation; preserve resumable draft without presenting uncommitted input as certified.

**Required evidence:** API contract tests and UI tests for country/recipe changes, slower/out-of-order responses, draft recovery, keyboard/RTL/LTR behavior, and no false-green readiness from unsaved input.

### WP5 — Release certification

**Scope:** reproducible clean-install setup to first sale; migration compatibility; service-only/finance-only path; localization boundaries; security and accessibility checks.

**Required evidence:** automated end-to-end run with the chosen recipe and approved localization; persisted operating context; actual invoice/ledger entries and their references to the selected organizational and financial dimensions; negative tests proving invalid context or missing required posting roles is rejected with actionable reason codes.

---

## 5. Acceptance Contract

The work is complete only when all applicable criteria have test evidence linked in the issue or CI run:

1. A new organization draft can be staged, edited, validated, resumed, and published through documented API/UI contracts.
2. Publication is safe to retry and cannot create duplicate organization nodes or attached resources for the same idempotency key/draft revision.
3. Invalid, cyclic (where disallowed), cross-company, or otherwise inconsistent relationships are rejected server-side before activation; failed publication leaves no partial active configuration.
4. UI status always corresponds to the current draft revision and the server’s validation result; stale responses and unsaved fields cannot produce a certified state.
5. Resource binding rules are explicit, scope-checked, actionable, and conditional on selected capabilities.
6. Finance readiness is role- and scenario-based, rejects non-postable or incompatible accounts, and is enforced again at transaction posting—not only in setup UI.
7. Generated periods follow the selected supported calendar policy, do not overlap, cover the intended range without unintended gaps, and reject transactions outside an open period.
8. The selected localization does not claim statutory compliance until the jurisdictional tax/e-invoicing behavior is implemented and independently tested.
9. A clean-install end-to-end proof records a successful sale and its ledger postings; negative paths demonstrate precise server-side rejection.
10. Arabic RTL and English LTR, keyboard accessibility, authorization boundaries, and migration compatibility are included in release evidence.

---

## 6. Issue Tracker Mapping

Use the existing issue tracker as the source of ownership. Do not create an issue number by prediction and do not assume numeric issue IDs map to the titles in the earlier draft; confirm actual titles before editing.

| Work package | Suggested ownership |
|---|---|
| Parent outcome and cross-cutting dependencies | Existing guided-installation parent issue |
| Blueprint lifecycle, graph rules, scoping, effective dating | Existing organization setup / Organization Governance issue |
| Capability-dependent module readiness and finance-role contract | Existing module/readiness issue if its scope matches; otherwise create a specifically titled finance-foundation issue after checking for duplicates |
| Guided setup UI and metadata-driven/reactive states | Existing setup UI issue |
| Clean-install, security, migration, and retail first-sale proof | Existing verification/certification issue |

Each updated issue should state: deliverable, explicit non-goals, dependencies, acceptance tests/evidence, and a link to this document. Keep separate finance-vs-organization ownership clear. Do not close an issue merely because files were added to this branch.

---

## 7. Source Map for Reviewers

- Organization setup and integration: `docs/OrganizationalArchitecture/04_INTELLIGENT_ORGANIZATION_SETUP_EXPERIENCE.md` and `08_ERP_INTEGRATION_AND_CAPABILITY_ARCHITECTURE.md`.
- Persistence/API contract: `docs/OrganizationalArchitecture/09_TECHNICAL_ARCHITECTURE_PERSISTENCE_AND_VERSIONING.md`.
- Roadmap/scenarios: `docs/OrganizationalArchitecture/10_IMPLEMENTATION_MASTER_PLAN_AND_ACCEPTANCE_SPEC.md`.
- Setup safety audit: `docs/Plans/setup-safety-audit-status.md`.
- Runtime code under review: `backend/app/Domains/EnterpriseCore/OrganizationGovernance/`, `backend/app/Http/Controllers/Api/V2/EnterpriseCore/OrganizationGovernance/`, `backend/routes/domains/01-enterprise-core.php`, and `frontend/app/setup/`.
- Finance implementation under review: `backend/app/Domains/Finance/` and the applicable API routes, models, migrations, and tests. Review the actual current paths before quoting line numbers in an issue.

---

## 8. Review Limitations

This document records a branch-level scope and evidence review; it is not a legal/tax opinion, a complete security audit, or a claim that every branch test passes. Implementation claims should be upgraded only after the named code path and automated evidence have been inspected. Database-engine support, statutory localization, and required payment/tax scenarios remain explicit product/domain decisions.
