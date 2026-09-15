# ACCORE ERP — Organizational Architecture & Organization Studio Specification

> **Official Engineering Specification & Blueprint Archive**  
> Complete Architectural Discovery, Domain Model, Taxonomy, Inference Engine, Blueprint System, UX Architecture, Technical Specifications, and Implementation Roadmap.

---

## Document Index & Reading Guide

| Document | Title | Core Focus & Coverage |
| :---: | :--- | :--- |
| **[01](./01_CURRENT_ERP_DISCOVERY_AND_AUDIT.md)** | **Current ERP Discovery & Organizational Architecture Audit** | Deep audit of existing ACCORE codebase, models, services, migrations, contradictions ("Two-Worlds" duality, SPRO jargon, inverted tree bug). |
| **[02](./02_ORGANIZATIONAL_DOMAIN_MODEL.md)** | **Organizational Domain Model** | Definitive domain definitions: Organization, Legal Entity, OrgUnit, Facets, Positions, Employees, Multi-Plane relationship networks. |
| **[03](./03_STRUCTURE_TAXONOMY_AND_PATTERN_SYSTEM.md)** | **Organizational Structure Taxonomy & Pattern System** | Research into the "57 structures" landscape, reduction to 7 fundamental archetypes, composable hybrid matrices, and natural language translation. |
| **[04](./04_INTELLIGENT_ORGANIZATION_SETUP_EXPERIENCE.md)** | **Intelligent Organization Setup Experience** | End-to-end user journey, conversational "Tell us about your business" flow, adaptive branching questions, progressive disclosure, beginner vs advanced modes. |
| **[05](./05_INFERENCE_AND_RECOMMENDATION_ENGINE.md)** | **Organization Inference & Recommendation Engine** | Signal extraction vector $\vec{X}$, affine scoring algorithm $S(A)$, confidence metrics, deterministic rules vs AI boundaries, and explainability synthesis. |
| **[06](./06_ORGANIZATION_BLUEPRINT_AND_GENERATION.md)** | **Organization Blueprint & Generation System** | The intermediate JSON blueprint data contract, lifecycle states, user-locking mechanism, and the atomic ACID `BlueprintCompiler`. |
| **[07](./07_ORGANIZATION_STUDIO_UX_AND_INTERACTION.md)** | **Organization Studio UX & Interaction Architecture** | "One Organization, Five Perspectives" (Legal, Facilities, Workforce, Financial, Matrix), interactive canvas, drag-and-drop relinking, property inspector. |
| **[08](./08_ERP_INTEGRATION_AND_CAPABILITY_ARCHITECTURE.md)** | **ERP Integration & Capability Architecture** | Tri-layer decoupling: Organization Structure vs ERP Capabilities vs Operational Configuration. Cross-domain integration (GL, Sales, Inventory, HR, ZATCA). |
| **[09](./09_TECHNICAL_ARCHITECTURE_PERSISTENCE_AND_VERSIONING.md)** | **Technical Architecture, Persistence, Versioning & Change Management** | Database DDL enhancements, transitive closure tables, recursive CTEs, temporal effective-dating algorithm, and RESTful v2 API contracts. |
| **[10](./10_IMPLEMENTATION_MASTER_PLAN_AND_ACCEPTANCE_SPEC.md)** | **Implementation Master Plan & Acceptance Specification** | Phased engineering roadmap (Phases 1–5), WBS, formal acceptance criteria for Scenarios A through H, backward compatibility and migration. |

---

## Architectural Principles Summary

1. **The Tri-Layer Decoupling Principle:** Organizational structure, ERP functional capabilities, and operational parameters are strictly decoupled. Activating or deactivating modules never breaks organizational graphs.
2. **The Faceted OrgUnit Pattern:** Rather than creating five redundant database rows (branch, warehouse, cost center, profit center, department) when a location opens, a single canonical `OrgUnit` node is projected with multiple operational facets.
3. **Multi-Plane Relationship Networks:** Organizations are not flat trees. ACCORE explicitly supports 5 distinct relationship planes (Legal Ownership, Line Management, Functional Matrix, Geographic Logistics, and Project Assignment) on a unified directed graph.
4. **Intermediate Blueprint Staging:** Business intent is translated into an explainable, customizable `OrganizationBlueprint` before atomic compilation into production database tables.
5. **Historical Integrity via Effective Dating:** Restructuring an organization creates time-sliced relationship edges (`valid_from`, `valid_to`), guaranteeing that historical financial statements and audit trails remain permanently true to their transaction dates.
