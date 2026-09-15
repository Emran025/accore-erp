# DOCUMENT 01 — Current ERP Discovery & Organizational Architecture Audit

**Domain:** EnterpriseCore / OrganizationGovernance  
**System:** ACCORE ERP (Laravel 12 + Next.js 16 + MariaDB)  
**Status:** Approved Architectural Audit  
**Author:** Senior ERP Product Architect & Lead Systems Engineer  

---

## 1. Executive Summary

A comprehensive architectural audit of the ACCORE ERP repository (`accore_erp`) was conducted, covering backend domain services, Eloquent models, database migrations, REST API contracts, frontend Next.js 16 layouts/components, and domain documentation. 

The audit reveals a system with **immense structural ambition and high-quality low-level primitives**, but burdened by a **fundamental architectural duality ("The Two-Worlds Problem")**, **SAP-centric jargon leaking into user workflows**, and **rigid procedural templating** that restricts organizational design to a small set of static choices.

Specifically, ACCORE already possesses:
1. An advanced, polymorphic directed-graph engine (`structure_nodes`, `structure_links`, `topology_rules_matrix`, `org_meta_types`, `org_change_history`) capable of modeling arbitrary organizational units and links.
2. A mature operational-readiness and operating-context gate (`OperatingContext`, `ModuleReadinessService`, `OperatingContextService`) that enforces organizational prerequisites before ERP transactions can execute.
3. Dedicated relational models for traditional enterprise constructs (`departments`, `positions`, `job_titles`, `employees`, `cost_centers`, `profit_centers`, `warehouses`, `pos_terminals`).

However, these components currently suffer from severe architectural contradictions:
- **The Two-Worlds Duality:** Parallel definitions of organizational units exist simultaneously in the graph (`structure_nodes`) and in relational tables (`cost_centers`, `profit_centers`, `departments`), glued together by reactive synchronization routines (`OrgIntegrationService`) that suffer from synchronization lag and integrity risk.
- **SAP SPRO Cognitive Burden:** Concepts like `CLIENT`, `COMP_CODE`, `CONTROLLING_AREA`, `VALUATION_AREA`, and `K4 Variant` are exposed directly to users and hardcoded into initial setup logic, alienating small-to-midsize businesses.
- **Rigid Procedural Templates:** The onboarding experience relies on 6 monolithic, all-or-nothing templates (`OrganizationTemplateService`) that atomically insert pre-canned nodes with fixed codes (`CLIENT-xxx`, `CA-xxx`, `CC-xxx`), offering no natural business questionnaire, no inference, and no intermediate editable blueprint.
- **Single-Tree Visualization Limitation:** The current UI attempts to force multi-dimensional enterprise structures (legal, operational, reporting, financial, physical logistics) into a single directed hierarchy tree, causing visualization collapse.

This audit establishes the empirical baseline for the design of the **Universal Organizational Architecture & Organization Studio**.

---

## 2. Inventory of Relevant Codebase Artifacts

### 2.1 Backend Domain Models & Schema Migrations

| Table / Entity | File Path | Primary Keys / Indexes | Key Responsibilities & Role in Org Architecture |
| :--- | :--- | :--- | :--- |
| `org_meta_types` | [`OrgMetaType.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Models/OrgMetaType.php)<br>Migration: `2026_02_22_000001` | `id` (VARCHAR 32, PK) | Defines meta-types of units (e.g. `COMP_CODE`, `PLANT`, `COST_CENTER`, `SALES_ORG`). Seeded with 28 SAP-aligned types across 7 domains. |
| `org_meta_type_attributes` | [`OrgMetaTypeAttribute.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Models/OrgMetaTypeAttribute.php)<br>Migration: `2026_02_22_000002` | `id` (BigInt PK), (`org_meta_type_id`, `attribute_key`) UK | Schema definition for attributes expected in `structure_nodes.attributes_json` (e.g., currency, country, calendar). |
| `topology_rules_matrix` | [`TopologyRule.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Models/TopologyRule.php)<br>Migration: `2026_02_22_000003` | `id` (BigInt PK), (`source_node_type_id`, `target_node_type_id`) | Governance rule enforcing allowed link directions, cardinalities (`1:1`, `1:N`, `N:1`, `N:M`), and JSON constraint logic. |
| `structure_nodes` | [`StructureNode.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Models/StructureNode.php)<br>Migration: `2026_02_22_000004` | `node_uuid` (UUID PK), (`node_type_id`, `code`) UK | Concrete polymorphic instance of an organizational unit. Stores flexible properties in `attributes_json`, with temporal validity (`valid_from`, `valid_to`). |
| `structure_links` | [`StructureLink.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Models/StructureLink.php)<br>Migration: `2026_02_22_000005` | `id` (BigInt PK), (`source_node_uuid`, `target_node_uuid`, `link_type`) UK | Directed edge representing parent-child or assignment relationship. In current code, `source` is child and `target` is parent. |
| `org_change_history` | [`OrgChangeHistory.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/HumanCapital/WorkforceAdmin/Models/OrgChangeHistory.php)<br>Migration: `2026_02_22_000006` | `id` (BigInt PK) | Append-only audit trail logging `old_values`, `new_values`, `change_type`, and `changed_by` across all org graph mutations. |
| `cost_centers` | [`CostCenter.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/Finance/ManagementAccounting/Models/CostCenter.php)<br>Migration: `2026_03_04_000002` | `id` (BigInt PK), `code` (UK), `structure_node_uuid` (FK index) | Relational cost center with hierarchical self-reference (`parent_id`), manager link, and GL accounts. |
| `profit_centers` | [`ProfitCenter.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/Finance/ManagementAccounting/Models/ProfitCenter.php)<br>Migration: `2026_03_04_000002` | `id` (BigInt PK), `code` (UK), `structure_node_uuid` (FK index) | Relational profit center with hierarchical self-reference (`parent_id`), targets, revenue/expense accounts. |
| `departments` | [`Department.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/HumanCapital/WorkforceAdmin/Models/Department.php)<br>Migration: `2026_01_10_000001` | `id` (BigInt PK) | Traditional HR department record. Links to `manager_id` (Employee), `cost_center_id`, and `profit_center_id`. |
| `positions` | [`Position.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/HumanCapital/WorkforceAdmin/Models/Position.php)<br>Migration: `2026_03_04_000001` | `id` (BigInt PK), `position_code` (UK) | Concrete job slot linking `job_title_id`, `role_id` (RBAC), `department_id`, and `cost_center_id`. |
| `employees` | [`Employee.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/HumanCapital/WorkforceAdmin/Models/Employee.php)<br>Migration: `2026_01_10_000002` | `id` (BigInt PK), `employee_code` (UK) | Workforce personnel record linking `position_id`, `department_id`, `manager_id` (reporting tree), and `user_id`. |
| `warehouses` | [`Warehouse.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/SupplyChain/Inventory/Models/Warehouse.php)<br>Migration: `2026_08_14_000001` | `id` (BigInt PK), `code` (UK), `org_node_uuid` (FK index) | Physical inventory facility linked to `org_node_uuid` (typically `PLANT` or `STORAGE_LOC`), `cost_center_id`, `profit_center_id`. |
| `pos_terminals` | [`PosTerminal.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/Commercial/SalesLifecycle/Models/PosTerminal.php)<br>Migration: `2026_08_14_000001` | `id` (BigInt PK), `code` (UK), `org_node_uuid` (FK index) | Commercial point-of-sale checkout point assigned to a `warehouse_id`, `org_node_uuid`, and cost/profit centers. |
| `operating_contexts` | [`OperatingContext.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Models/OperatingContext.php)<br>Migration: `2026_08_14_000001` | `id` (BigInt PK), (`user_id`, `is_default`) Index | Active session anchor binding the user's execution context to a `org_node_uuid`, `warehouse_id`, `pos_terminal_id`, and financial centers. |

### 2.2 Backend Services

1. **[`OrgStructureService.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Services/OrgStructureService.php)** (862 lines):
   - Validates node creation, attributes schema, and parent constraints.
   - Enforces topological cardinality (`1:1`, `1:N`, `N:1`, `N:M`).
   - Implements `resolveScopeContext($anchorUuid)` which traverses upward to find root company code and controlling area.
   - Executes `runIntegrityCheck()` detecting orphan nodes, missing required attributes, and broken parent linkages.
   - Records change history via `recordChange()`.

2. **[`OrgIntegrationService.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Services/OrgIntegrationService.php)** (811 lines):
   - Implements bidirectional synchronization between relational tables (`cost_centers`, `profit_centers`, `positions`, `job_titles`, `employees`) and the polymorphic graph (`structure_nodes`).
   - Handles center open/close lifecycle propagation.
   - Provides health check metrics on unlinked centers or mismatched job title assignments.

3. **[`ModuleReadinessService.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Services/ModuleReadinessService.php)** (544 lines):
   - Computes whether ERP modules (`sales`, `purchases`, `general_ledger`, etc.) are operational.
   - Evaluates whether the user's `OperatingContext` has a valid path to `COMP_CODE`, whether fiscal periods are open, and whether graph integrity checks pass.

4. **[`OrganizationTemplateService.php`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Services/OrganizationTemplateService.php)** (364 lines):
   - Stores user onboarding setup profile in `settings` (`setup.organization_profile`).
   - Hardcodes 6 templates: `single_store_retail`, `single_store_service`, `multi_site_retail`, `professional_services`, `manufacturing`, `enterprise_blueprint`.
   - Procedurally creates nodes (`CLIENT`, `COMP_CODE`, `CONTROLLING_AREA`, `COST_CENTER`, `PROFIT_CENTER`, `PLANT`, `STORAGE_LOC`, `PURCH_ORG`, `SALES_ORG`) in a single DB transaction.

### 2.3 Frontend Layouts & Components

1. **Setup Wizard (`/setup`)**:
   - [`SetupOrganizationProfileSection.tsx`](file:///c:/xampp/htdocs/accsystem/accore_erp/frontend/app/setup/components/SetupOrganizationProfileSection.tsx): Form presenting the 6 template cards, company name/code, currency, and calendar selectors.
   - [`OrganizationArchitectureWorkspace.tsx`](file:///c:/xampp/htdocs/accsystem/accore_erp/frontend/app/setup/components/OrganizationArchitectureWorkspace.tsx): 3-phase stepper ("foundation", "core_operations", "extensions") showing an indented tree and node creation form.
   - [`SetupOperatingScopeSection.tsx`](file:///c:/xampp/htdocs/accsystem/accore_erp/frontend/app/setup/components/SetupOperatingScopeSection.tsx): Operating context selector for warehouse and POS terminal.

2. **Advanced Organization Governance Studio (`/01-enterprise-core/organization-governance/org-structure/org-hierarchy`)**:
   - [`OrganizationalStructure.tsx`](file:///c:/xampp/htdocs/accsystem/accore_erp/frontend/app/01-enterprise-core/organization-governance/org-structure/org-hierarchy/(pages)/OrganizationalStructure.tsx): Container with 9 tabs (`dashboard`, `hierarchy`, `nodes`, `links`, `meta_types`, `topology_rules`, `scope_context`, `integrity`, `change_history`).
   - [`HierarchyTab.tsx`](file:///c:/xampp/htdocs/accsystem/accore_erp/frontend/app/01-enterprise-core/organization-governance/org-structure/org-hierarchy/components/HierarchyTab.tsx): Interactive tree rendering structure nodes colored by domain.

---

## 3. Deep Architectural Analysis & Existing Assumptions

### 3.1 What ACCORE Currently Considers an "Organization" vs a "Company"
- **Organization:** In the polymorphic graph, the entire graph is rooted at a node of type `CLIENT` (SAP Mandant equivalent). An organization is implicitly the collection of all nodes belonging to that client.
- **Company:** Represented strictly by node type `COMP_CODE` (Company Code). It is defined as a legal entity capable of publishing financial balance sheets and P&L statements.
- **Limitation:** In `OrganizationTemplateService.php`, each template creates exactly one `COMP_CODE`. There is no first-class representation of corporate hierarchies, parent holding companies, subsidiaries, or joint ventures. If a business has two legal entities (e.g., HoldCo and TradingCo), the setup wizard cannot accommodate them.

### 3.2 How Users and Employees Belong to Organizations
- **User Identity:** `User` has `role_id` and can authenticate.
- **Employee Identity:** `Employee` has personal, payroll, and HR attributes. An employee links optionally to a `User` (`user_id`).
- **Assignment Chain:**
  $$\text{Employee} \longrightarrow \text{Position} \longrightarrow \text{Department} \longrightarrow \text{Cost Center} \longrightarrow \text{StructureNode (COST\_CENTER)}$$
  $$\text{Employee} \longrightarrow \text{Manager (Self-referencing FK on employees.manager\_id)}$$
- **Contradiction:** An employee's organizational placement is tied to `departments.id` and `positions.id`, completely bypassing `structure_nodes`. Meanwhile, the polymorphic graph defines `HR_ORG_UNIT` and `POSITION` meta-types in `OrgStructureSeeder.php`, but the HR module uses the relational `departments` and `positions` tables instead!

### 3.3 How Branches, Warehouses, and Plants are Represented
- In the graph: A physical site is modeled as `PLANT`. Sub-locations are `STORAGE_LOC`.
- In the relational tables: Inventory uses `warehouses`. Sales uses `pos_terminals`.
- Linking Mechanism: `warehouses.org_node_uuid` points to a `structure_nodes.node_uuid` (the `PLANT`), and `pos_terminals.org_node_uuid` points to the same node.
- Weakness: There is no distinct `BRANCH` meta-type! A commercial retail branch is conflated with an industrial manufacturing `PLANT`. A branch that combines a retail store, small storage backroom, and office has to be modeled as a `PLANT` with child `STORAGE_LOC`, which confuses commercial operators.

### 3.4 How Financial Accounting and Reporting Entities are Scoped
- `UniversalJournal` (header) and `GeneralLedger` (lines) represent the financial truth.
- Lines record `cost_center_id` and `profit_center_id`.
- Neither `universal_journals` nor `general_ledger` contains a `company_code_id` or `structure_node_uuid` column!
- Scoping assumption: The system assumes all entries belong to the single active company code configured during setup. If multi-company consolidation or intercompany billing is needed, the ledger has no explicit legal entity dimension.

### 3.5 How Permissions and Operating Context are Scoped
- RBAC is defined by `roles` and `role_permissions` (`module_id`, `can_view`, `can_create`, `can_edit`, `can_delete`).
- Runtime scoping is governed by `OperatingContext`:
  ```php
  // OperatingContext fields:
  user_id, org_node_uuid, warehouse_id, pos_terminal_id, cost_center_id, profit_center_id
  ```
- Before creating sales invoices or purchase orders, the user's `OperatingContext` must be active and linked to an operational unit with a verified path to `COMP_CODE`.
- Strength: This is an excellent operational security boundary.
- Weakness: Context switching is rigid. A manager overseeing multiple branches cannot easily operate across branches without manually modifying or switching their operating context record.

---

## 4. Specific Architectural Contradictions & Technical Debt

### Contradiction 1: The "Two-Worlds" Model Disconnect
```
[Polymorphic Graph World]               [Relational Table World]
     structure_nodes                         departments
     structure_links                         positions
     org_meta_types                          cost_centers
     topology_rules                          profit_centers
                                             warehouses
```
- **Evidence:** `OrgIntegrationService.php` contains hundreds of lines of code (`syncCostCenterToOrgChart`, `syncProfitCenterToOrgChart`, `syncOrgNodeToCostCenter`, `syncJobTitleToPositions`, `syncJobTitleToEmployees`) trying to synchronize the two worlds.
- **Problem:** If a cost center is created in the financial module, it must trigger an asynchronous or transactional sync to create a `structure_node`. If a user edits the node in `OrgStructureController`, it must sync back to `cost_centers`.
- **Failure Mode:** Inconsistencies occur when attributes are updated in one world but not the other, leading to orphaned references and integrity check failures.

### Contradiction 2: SPRO Jargon vs Small Business Usability
- **Evidence:** `OrgStructureSeeder.php` lines 41-315 define:
  `CLIENT`, `COMP_CODE`, `CONTROLLING_AREA`, `BUS_AREA`, `FUNC_AREA`, `SEGMENT`, `CREDIT_CTRL_AREA`, `VALUATION_AREA`, `PURCH_ORG`, `PURCH_GROUP`, `SALES_ORG`, `DISTR_CHANNEL`, `DIVISION`, `SALES_OFFICE`, `SALES_GROUP`, `PERSONNEL_AREA`, `PERSONNEL_SUBAREA`.
- **Problem:** This is an exact clone of SAP ECC/S4HANA enterprise structure vocabulary.
- **Impact:** While appropriate for an oil conglomerate or multi-national automotive firm, it is completely incomprehensible to a grocery owner, an e-commerce brand, a pharmacy, or a consulting firm with 20 staff.

### Contradiction 3: Monolithic, All-or-Nothing Template Execution
- **Evidence:** [`OrganizationTemplateService.php#L198-L323`](file:///c:/xampp/htdocs/accsystem/accore_erp/backend/app/Domains/EnterpriseCore/OrganizationGovernance/Services/OrganizationTemplateService.php#L198-L323):
  The `apply()` method creates 8-10 nodes in a single hardcoded closure.
  Lines 184-186 explicitly state:
  `"This organization template has already been applied. Use the advanced designer for controlled expansion."`
- **Problem:** The user cannot preview the generated structure, customize unit names, remove unwanted parts (e.g. disable purchasing org if they do not want procurement), or adjust reporting lines *before* committing to the database.

### Contradiction 4: Inverted Graph Traversal Bug in HierarchyTab
- **Evidence:** In `backend/database/seeders/OrgStructureSeeder.php#L459`:
  `source_node_type_id: COMP_CODE, target_node_type_id: CLIENT`
  The source is the child, and the target is the parent.
- In `frontend/.../HierarchyTab.tsx#L101`:
  ```typescript
  outLinks.forEach((link) => {
      parentSet.add(link.target_node_uuid); // target is parent
  });
  ...
  const rootNodes = nodes.filter((n) => !parentSet.has(n.node_uuid));
  ```
- **Bug:** Since `parentSet` collects all parents (e.g., `CLIENT`), `rootNodes` filters for nodes that are *not* in `parentSet`. This causes leaf nodes to be treated as roots, inverting the intended hierarchy tree!

### Contradiction 5: Ledger Disconnect from Legal Hierarchy & Temporal Drift
- **Evidence:** `UniversalJournal` and `GeneralLedger` only store foreign keys to `cost_centers.id` and `profit_centers.id`.
- **Problem:** If a cost center moves from "Branch North" to "Branch South" on 2026-06-01:
  Historical transactions posted in 2025 will dynamically rollup to "Branch South" when grouped via the current graph link, unless temporal link validity (`valid_from`/`valid_to`) is explicitly evaluated at `voucher_date`!
  Currently, reporting queries do not join on `structure_links` with date predicates matching `general_ledger.voucher_date`.

---

## 5. Architectural Assets to Preserve & Leverage

Despite the flaws noted above, ACCORE has built foundational capabilities that must NOT be discarded:
1. **The Graph Metamodel (`structure_nodes`, `structure_links`, `topology_rules_matrix`):**  
   The underlying schema is clean, well-indexed, and mathematically capable of representing Directed Acyclic Graphs (DAGs) and matrix relationships. It should remain the core storage engine.
2. **`OrgStructureService` Integrity Engine:**  
   The validation routines (`runIntegrityCheck()`, `evaluateConstraintLogic()`, `enforceCardinality()`) provide enterprise-level safety against invalid topologies and should be enhanced, not rewritten.
3. **`OperatingContext` Runtime Binding:**  
   The requirement that transactions operate within a validated organizational context guarantees transactional integrity and regulatory compliance.
4. **Change History Audit (`org_change_history`):**  
   Every node and link mutation is logged with previous and updated JSON representations.

---

## 6. Audit Conclusion & Architectural Directive

ACCORE does not need a rewrite of its database primitives. Rather, it requires:
1. **A Semantic Translation Layer:** An intelligent layer that maps plain-language business descriptions into structural archetypes without forcing the user to learn SAP terminology.
2. **An Organization Blueprint Abstraction:** A decoupled intermediate specification generated from business intent that can be visualized, modified, validated, and verified *before* compiling into database nodes and operational records.
3. **A Harmonized Domain Entity Unification:** Eliminating the "Two-Worlds" duality by making `structure_nodes` the definitive master entity, with relational records (`CostCenter`, `Warehouse`, `Department`) acting as domain projections or synchronized facets of the underlying node.
4. **Organization Studio:** A modern, multi-view visual workspace replacing the raw tables and inverted tree with purpose-built perspectives: Legal/Consolidation, Operational/Facilities, Reporting/Hierarchy, and Financial Responsibility.
