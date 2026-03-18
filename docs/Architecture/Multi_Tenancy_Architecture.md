---
title: "ADR-006: Multi-Tenancy Architecture"
domain: "cross-cutting"
subdomain: ""
tier: 2
status: approved
task_id: "ARCH-006"
template: "architecture-decision-record"
version: "1.0.0"
created: "2026-03-18"
last_updated: "2026-03-18"
word_count: 548
---

# ADR-006: Multi-Tenancy Architecture

## Context

Enterprise ERP deployments must declare an explicit tenancy model: whether a single instance serves multiple customer organizations (multi-tenant), or one instance serves a single organization (single-tenant). This decision governs database schema design, access control boundaries, data isolation guarantees, and deployment topology. Deferring or obscuring this choice produces security vulnerabilities — principally, unintended cross-organization data exposure.

ACCSYSTEM manages financial, payroll, commercial, and compliance data. The sensitivity of this data demands that the tenancy boundary be formally documented and enforced at the architectural level, not left to convention.

## Decision

ACCSYSTEM is architected as a **single-tenant** system. Each deployed instance serves exactly one organization. There is no tenant identifier column in any domain model, no tenant resolution middleware in the HTTP stack, and no tenancy-scoped query scope applied at the data access layer.

Organizational complexity within that single tenant is managed through the **Organization Governance** subdomain, which implements a SAP-inspired polymorphic hierarchy. All organizational units — Company Codes, Business Units, Plants, Cost Centers, Profit Centers — are represented as typed nodes in a single `structure_nodes` table, linked by a `structure_links` adjacency table. This provides arbitrary depth and breadth of internal organizational structure without introducing multi-tenancy.

## Rationale

The single-tenant model was selected on the following grounds:

**Security isolation:** A shared-database, shared-schema multi-tenant design requires every query to include a `tenant_id` predicate. Missing predicates expose cross-tenant data. The single-tenant model eliminates this entire attack surface — database-level isolation is absolute by default.

**Regulatory compliance:** ACCSYSTEM targets jurisdictions with strict data residency requirements (including ZATCA compliance for Saudi e-invoicing). A dedicated instance per organization simplifies audit, data residency controls, and regulatory reporting scopes.

**Organizational depth without tenancy:** The `StructureNode` model provides the organizational segmentation typically conflated with multi-tenancy. A single organization can model multiple legal entities, geographic regions, and reporting hierarchies without a shared instance.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Shared-database, shared-schema (tenant_id column) | Introduces cross-tenant data leakage risk; requires query-scope discipline across all 100+ models |
| Shared-database, separate-schema (schema-per-tenant) | Adds schema management complexity; not supported by the SQLite development backend |
| Separate database per tenant (database-per-tenant) | Operationally viable but unnecessary given the confirmed single-organization deployment model |
| SaaS multi-tenant with tenant resolver middleware | No evidence of tenant resolution logic in any middleware or route group; not consistent with the current system design |

## Consequences

**Positive:**
- Cross-tenant data leakage is structurally impossible — no predicate enforcement required
- Database schema remains uncomplicated by tenant scoping columns or row-level security policies
- Regulatory data residency is trivially satisfied: each deployment is an isolated artifact
- Organizational hierarchy depth is unlimited without multi-tenancy overhead

**Negative:**
- Hosting multiple organizations requires deploying and maintaining separate instances
- Shared infrastructure costs (compute, database, backups) cannot be amortized across organizations in a single instance
- Feature updates must be deployed to each instance independently

**Technical Debt:**
<!-- [ASSUMPTION] --> If future product strategy requires SaaS multi-tenancy, a significant refactor will be required to introduce tenant scoping across all domain models, services, and query layers. The current architecture does not provide a migration path for this scenario.

## Status

`accepted`

## Related Decisions

- ADR-002: Domain-Driven Design in Laravel — defines the domain model boundaries that would need tenant scoping in a future multi-tenant evolution
- ADR-001: Frontend-Backend Separation — each deployed instance exposes its own API endpoint, reinforcing the single-tenant boundary at the network level

## Assumptions & Open Questions

1. <!-- [ASSUMPTION] --> The tenancy model is inferred from the absence of tenant resolution code. No explicit architectural decision record for single-tenancy was found in the source repository prior to this document. **NEEDS_VERIFICATION** by Chief Architect to confirm this is deliberate and not an oversight.
