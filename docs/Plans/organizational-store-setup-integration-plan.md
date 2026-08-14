# Organizational Setup, Store Readiness, and Warehouse-Driven Commerce Plan

**Author:** Manus AI
**Status:** Proposed implementation plan following repository review
**Scope:** Startup configuration, organizational structure, positions, cost and profit centres, point-of-sale readiness, warehouse-controlled sales and purchasing, and English developer-facing compilation errors.

## 1. Executive Direction

Accore ERP already contains a strong domain-oriented Laravel backend and a Next.js interface with reusable layout, navigation, dialog, selection, input, confirmation, and feedback components. The next improvement should not be an isolated onboarding product or a parallel set of interfaces. It should be a **guided readiness flow inside the existing organizational structure experience**, evaluated at application startup and driven by the configuration already maintained in the organizational model.

The intended outcome is a coherent operational chain for a small shop: an authorized administrator creates the legal and operating unit, defines a store/branch and warehouse, connects the required financial centres, creates operating positions, configures a point of sale, and then starts sales and purchasing from an explicitly selected warehouse. Each completed step must update the organizational readiness state and unlock the next operational capability. The process should be resumable, auditable, idempotent, and safe to run repeatedly.

> The implementation must preserve the existing domain separation, API response envelope, Next.js App Router conventions, and reusable interface layer. It must not introduce a new visual framework or duplicate generic controls that already exist in `frontend/components`.

## 2. Review Findings

| Area reviewed | Existing capability | Gap to close |
|---|---|---|
| Application startup | The Next.js application has an established root layout, `MainLayout`, shared navigation, authentication state, API wrapper, and reusable UI primitives. | There is no consolidated readiness query or startup decision that determines whether the tenant can operate a shop. |
| Organizational structure | `StructureNode`, `OrgMetaType`, topology rules, links, integrity checks, scope analysis, dashboard and history tabs already provide a mature organizational graph. | Store, warehouse, POS terminal, and their operational prerequisites are not represented as a cohesive readiness model or setup journey. |
| Existing automation | `OrgIntegrationController` and `OrgIntegrationService` already support cost-centre, profit-centre, job-title, position, and bulk synchronization operations. | Synchronization is fragmented and user-triggered; it does not create or validate a complete, transactionally consistent store operating context. |
| Positions | Human Capital exposes position CRUD and employee assignment. The organizational integration service synchronizes job titles with positions and employees. | A position is not yet explicitly scoped to a branch/store, terminal, warehouse, cost centre, or operating responsibility. |
| Cost and profit centres | Finance exposes CRUD, tree views, and bulk synchronization to the organization chart. | Centre selection is not consistently resolved from the active operating unit during sales, purchasing, or inventory posting. |
| Point of sale | Inventory service availability currently stores a string `pos_location` for service availability. | There is no authoritative POS terminal model, endpoint set, org-node link, cashier assignment, opening session, or warehouse source. |
| Warehouse and inventory | Products, batch processing, periodic inventory, and inventory views exist. | The reviewed backend route and domain surface does not expose a dedicated warehouse aggregate or a uniform `warehouse_id` contract for product balances, sales invoices, or purchase receipts. |
| Sales and purchases | Invoice, purchase, and product flows are implemented. | `StoreInvoiceRequest`, `StorePurchaseRequest`, and `StoreProductRequest` currently do not require an operating unit, warehouse, POS terminal, cost centre, or profit centre. This prevents controlled warehouse issue and receipt operations. |
| Compilation | The latest `npm run build` completed successfully and the frontend test suite passed. | There is no active compile failure to translate. A durable policy is still needed so all developer-facing build, type, CI, and API diagnostic messages remain English. |

## 3. Target Operating Model

The operating model should treat the organizational graph as the source of operational scope and treat financial, commercial, and inventory records as linked operational aggregates. A small shop therefore has one minimum viable chain:

| Configuration layer | Required record | Required relationship | Purpose |
|---|---|---|---|
| Legal layer | Company or legal entity node | Root organizational node | Owns the accounting, taxation, and master-data boundary. |
| Operating layer | Branch/store node | Child of company | Defines the business location where sales and purchasing are performed. |
| Financial layer | Cost centre and profit centre | Linked to the branch/store node | Supplies default managerial accounting dimensions for commercial postings. |
| Inventory layer | Warehouse | Linked to the branch/store node | Holds available stock and receives purchases. |
| Commerce layer | POS terminal | Linked to store node and default warehouse | Determines the sales source, cashier scope, pricing context, and transaction numbering. |
| Workforce layer | Manager and cashier/sales positions | Scoped to store, with optional terminal responsibility | Limits operational assignments and creates a clear accountability model. |
| Transaction layer | Sales invoice, purchase receipt, stock movement | Carries resolved operating context | Makes every inventory and financial movement traceable to its source unit. |

The **Operating Context** is the durable resolution object that should be returned to the frontend and accepted by transaction APIs. It contains `organization_node_uuid`, `branch_id` or `store_id`, `warehouse_id`, `pos_terminal_id` where applicable, `cost_center_id`, `profit_center_id`, currency, tax profile, and effective user permissions. The frontend must not independently infer these links from labels or unverified local state.

## 4. Startup Readiness and Transitional Interface

### 4.1 Startup behavior

At authenticated application startup, `MainLayout` should request a lightweight endpoint such as `GET /api/v2/operating-context/readiness`. The endpoint returns the user’s active context, missing prerequisites, permitted actions, and the next recommended setup step. This evaluation must remain non-blocking for users who only have read access, but it should guide authorized administrators until a valid operating context exists.

The readiness experience should be rendered through already available reusable components: `MainLayout`, `Dialog`, `TabNavigation`, `SearchableSelect`, `Select`, `TextInput`, action buttons, confirmation dialogs, alert/toast utilities, and existing card/status styles. The flow should appear as a contextual setup panel or dialog, not as a new standalone application, sidebar framework, or design system.

### 4.2 Smooth transition rules

The interface should open at the first incomplete prerequisite and persist progress on every successful server response. A user can exit and resume later, but a transaction surface must show a clear English operational warning if its required context is incomplete. It should never silently choose a warehouse or financial centre.

Each transition must use the server’s returned readiness payload. For example, once a branch is saved, the next step is enabled only after the API returns its node identifier and allowed descendants. Once the warehouse is created and linked, the POS terminal selector must load only warehouses available under the active branch. Completion should show a compact readiness summary and a direct transition to the existing sales or purchase screen rather than creating a new commercial dashboard.

### 4.3 Small-shop setup sequence

| Step | Existing interface location | Reused controls | Server operation | Completion criterion |
|---|---|---|---|---|
| 1. Confirm legal entity and operating branch | Organizational Structure dashboard/nodes tab | Existing form panel, select controls, status widgets | Create or select structure nodes and validated topology links | One active branch/store node exists. |
| 2. Configure financial responsibility | Organizational Structure dashboard plus existing cost/profit centre pages | Searchable selection, table actions, confirmation dialog | Create or link cost and profit centres through an atomic orchestration endpoint | Both centres are active and linked to the branch. |
| 3. Configure staff roles | Existing HR Administration positions page | Existing position form and selectors | Create store manager and cashier/sales positions; optionally assign employees | At least one authorized operating position exists. |
| 4. Configure warehouse | Organizational Structure readiness panel and existing inventory selectors | Existing form controls and status chips | Create warehouse aggregate; link it to branch and finance defaults | Exactly one default receiving/selling warehouse exists. |
| 5. Configure POS terminal | Organizational Structure readiness panel | Dialog, form inputs, selectors, confirmation dialog | Create POS terminal; link it to branch, warehouse, cashier role, tax profile, and numbering policy | Terminal status is active and has a valid default warehouse. |
| 6. Review and activate | Existing dashboard/status widgets | Existing action list, confirmation dialog, toast | Execute readiness validation and activation | The operating context reports `ready = true`. |

## 5. Backend Design and Automation Plan

### 5.1 Keep existing synchronization; add an orchestration boundary

The existing `OrgIntegrationService` should remain responsible for targeted synchronization of cost centres, profit centres, job titles, positions, and organizational nodes. It should not be replaced. A new application-level orchestration action, for example `ConfigureOperatingContextAction`, should coordinate setup commands in one database transaction and call the existing integration actions where appropriate.

The orchestration action must accept an idempotency key and a deliberate command payload. It must return an `OperatingContextResource` containing the resolved identifiers, created-versus-reused records, validation issues, and next readiness state. The request must be retriable without duplicate centres, warehouses, terminals, positions, or graph links.

### 5.2 New aggregates and links

A dedicated warehouse aggregate and a dedicated POS terminal aggregate are required. A free-form `pos_location` string is insufficient because it cannot enforce stock ownership, cashier authorization, session state, or financial posting defaults.

| Aggregate | Core fields | Required links | Essential lifecycle states |
|---|---|---|---|
| `warehouses` | `id`, code, name, type, active flag, address/reference | `org_node_uuid`, default cost centre, default profit centre | Draft, active, suspended, closed |
| `pos_terminals` | `id`, code, name, active flag, terminal type, receipt sequence | `org_node_uuid`, `warehouse_id`, cost centre, profit centre, tax profile | Draft, active, suspended, closed |
| `pos_sessions` | `id`, terminal, cashier, opening cash, close totals, timestamps | `pos_terminal_id`, `user_id`, active warehouse | Open, closing, closed, reconciled |
| `inventory_balances` or ledger-backed balance projection | product, warehouse, available, reserved, on-order | `product_id`, `warehouse_id` | Derived and immutable through movements |
| `inventory_movements` | type, quantity, source, destination, reference, posting state | sales invoice, purchase receipt, warehouse, user, POS session | Draft, posted, reversed |
| `operating_contexts` or resolved context view | current unit defaults and readiness | organization, warehouse, financial centres, terminal, user scope | Draft, ready, suspended |

Existing `StructureNode.attributes_json` may hold supplemental metadata, but canonical foreign-key relationships must live in dedicated aggregate tables. This prevents brittle JSON joins, makes referential validation explicit, and keeps the organizational graph readable.

### 5.3 Required API surface

The following API family should be introduced under the existing v2 organizational and inventory conventions. The final naming should match current route conventions, but responsibility must remain explicit.

| Endpoint responsibility | Example operation | Rule |
|---|---|---|
| Readiness discovery | `GET /v2/operating-context/readiness` | Returns active context, missing items, allowed actions, and English diagnostic codes. |
| Atomic configuration | `POST /v2/operating-context/configure` | Creates or reuses a complete configuration set with an idempotency key. |
| Context activation | `POST /v2/operating-context/select` | Validates that the selected unit is in the user’s permitted scope. |
| Warehouse management | `GET/POST/PUT /v2/warehouses` | Enforces branch and financial-centre linkage before activation. |
| POS management | `GET/POST/PUT /v2/pos-terminals` | Enforces active branch, warehouse, user role, tax profile, and numbering configuration. |
| POS session control | `POST /v2/pos-sessions/open` and `POST /v2/pos-sessions/{id}/close` | Requires an assigned terminal and cashier authorization. |
| Availability lookup | `GET /v2/inventory/availability?warehouse_id=&product_id=` | Returns available, reserved, and usable quantities for the chosen warehouse. |
| Readiness validation | `POST /v2/operating-context/validate` | Produces a deterministic prerequisite and integrity report. |

### 5.4 Transactional automation rules

A successful POS sale must resolve the terminal’s warehouse, branch, cost centre, profit centre, tax profile, and current session before invoice persistence. It must reserve inventory atomically, post the invoice and stock issue in the same transaction or through a transactional outbox, and reject insufficient stock with a deterministic English error code such as `inventory.insufficient_available_quantity`.

A purchase receipt must require the target warehouse. It must create a receiving movement, increase that warehouse’s balance, and assign the branch defaults only when the purchase explicitly permits inherited context. Direct product creation must no longer use a global stock quantity as the authoritative stock source; opening stock must be posted as a warehouse-specific opening balance or receiving movement.

The application must store a copy of the resolved operating context on commercial and inventory documents. Future changes to a branch’s default warehouse or centre must not rewrite the historical context of an existing invoice, purchase, receipt, or journal entry.

## 6. Frontend Integration Plan

### 6.1 Shared state and data boundaries

A focused `useOperatingContextStore` may be added only if it follows the established store conventions. It should hold the server-returned active context, readiness state, loading state, and context version. It must not duplicate organisation, warehouse, inventory, or finance records locally. Existing stores and `fetchAPI` should remain the only transport and state patterns.

The store should refresh after login, after a context-affecting save, when the user explicitly switches branch or terminal, and after a rejected transaction caused by stale context. It should never block authentication; it only governs operational availability after authentication succeeds.

### 6.2 Existing sales and purchasing screens

The existing sales-invoice, purchase-invoice, product, cost-centre, profit-centre, position, and organizational-structure screens should be enhanced in place.

| Screen | Required enhancement | Behavior |
|---|---|---|
| Sales invoice | Display a compact operating-context strip using existing cards/selectors. | Default warehouse and centres are shown; only authorized users may switch warehouse. Stock availability is refreshed per line item. |
| POS sale mode | Use selected terminal/session context. | Warehouse is terminal-derived and non-editable except for an authorized override with an audit reason. |
| Purchase invoice/receipt | Require target warehouse before line entry or posting. | Receipt posts directly to selected warehouse and displays the inherited branch/centre context. |
| Product setup | Replace global opening-stock semantics with a warehouse allocation action. | The user selects opening warehouse and quantity; the backend creates a traceable opening movement. |
| Organizational Structure dashboard | Surface readiness cards, integration exceptions, and deep links to existing centre/position pages. | The user sees actionable gaps without a duplicate module. |
| Cost/profit centre pages | Surface linked operating units and usage status. | A centre cannot be closed while used by an active warehouse, terminal, or open POS session. |
| Position page | Add optional operating-unit and terminal-scope assignment. | Staff can only open sessions or post transactions within assigned scope. |

### 6.3 UX constraints

The interface must preserve the current Arabic business UI where it already exists. Labels, setup steps, and user-facing success messages may remain localized according to the active application locale. By contrast, developer-facing compilation, type-checking, CI, logs, API diagnostic codes, and fallback error messages must be English. The frontend should map stable English backend error codes to localized user-facing messages; it must not expose raw translated exception strings as the sole integration contract.

## 7. Compile-Error English Policy

The reviewed production frontend build currently succeeds, so there is no active compile error to translate. The following policy should prevent future ambiguity:

1. All TypeScript, Next.js, Rust, PHP, CI, and automated-test diagnostics must be emitted in English. Build scripts, workflow names, error boundaries, developer logs, and API fallback messages should use English.
2. Backend business failures must provide a stable English machine code and an English default message. The UI may render Arabic or another locale from a translation map.
3. CI should preserve raw build output and upload failure logs as artifacts. Release creation must continue to depend on successful platform builds.
4. Tests must assert diagnostic codes and response structures rather than brittle translated phrases.
5. New error handling must use the current `{ success, data, message }` envelope and preserve the existing HTTP status semantics.

## 8. Implementation Roadmap

| Phase | Scope | Main deliverables | Exit criterion |
|---|---|---|---|
| Phase A — Discovery and contracts | Validate accounting, tax, multi-branch, and warehouse policy choices with product owners. | Approved operating-context schema, user role matrix, default inheritance rules, and error-code catalogue. | All required decisions are documented and accepted. |
| Phase B — Persistence and domain rules | Add warehouse, POS terminal, session, movement, and context persistence with foreign keys and audit columns. | Migrations, models, policies, actions, resources, factories, and data-integrity rules. | Domain tests verify creation, activation, closure, and invalid-link rejection. |
| Phase C — Context orchestration | Build readiness, configuration, validation, and selection APIs; reuse current organization synchronization services. | Idempotent orchestration action, integration status enrichment, atomic transaction handling, outbox/event design if required. | Repeated configuration commands create no duplicate records and return deterministic readiness. |
| Phase D — Inventory and commercial enforcement | Require warehouse/context on receipts and invoices; write movements and availability updates. | Request validation, posting actions, stock reservation/release, journal context propagation, reversal logic. | Sales and purchases cannot post without a valid warehouse context; balances reconcile. |
| Phase E — Guided startup experience | Add readiness detection to startup and enhance existing organization and transaction screens. | Existing-component-only setup panel, status cards, context selector, transaction context strip, English developer diagnostics. | A new administrator can configure a small shop and reach an active POS-ready state without leaving the established interface pattern. |
| Phase F — Hardening and rollout | Add migration tools, test coverage, telemetry, permission checks, and progressive enablement. | Seed templates, feature flag, migration/repair command, audit dashboards, user documentation. | Pilot store completes opening, sale, purchase receipt, close, and reversal scenarios reliably. |

## 9. Data Integrity, Security, and Audit Requirements

Every configuration command must be authorized against organizational scope. The backend must reject a user who attempts to select a branch, warehouse, centre, position, or terminal outside their permitted scope. A closed centre, warehouse, or terminal must be unusable for new postings while preserving historical reporting access.

All cross-domain configuration changes must be journaled with actor, time, previous value, new value, reason when relevant, correlation ID, and idempotency key. Financial, inventory, and POS session operations must be reversible through compensating business actions rather than destructive deletion. Database foreign keys and unique constraints should enforce one default warehouse per active terminal, unique terminal code per branch, and non-duplicated active mappings.

## 10. Test Strategy and Acceptance Scenarios

The implementation should add Laravel feature tests, domain/action tests, and Vitest tests that conform to the current project patterns. High-value scenarios include the following.

| Scenario | Expected result |
|---|---|
| New shop bootstrap | One command or guided sequence creates the branch, linked centres, warehouse, terminal, and required positions without duplicate records on retry. |
| Incomplete setup | Startup readiness identifies the exact missing prerequisite and sales/purchase posting is prevented with English diagnostic code. |
| POS sale | Active cashier opens a terminal session, sells stock from the terminal warehouse, and receives a posted invoice plus immutable inventory movement. |
| Insufficient inventory | Sale is rejected without partial invoice, stock, or journal effects. |
| Purchase receipt | Goods are received directly into the selected warehouse and become available only there. |
| Warehouse override | Unauthorized override is rejected; authorized override captures reason and audit record. |
| Deactivation | A warehouse, centre, or terminal with dependent open work cannot be closed incorrectly. |
| Historical integrity | Changing a branch default does not change old invoice, purchase, or inventory movement context. |
| Error language | Build, CI, type, API fallback, and developer logs are English; end-user content follows application locale. |

## 11. Decisions Required Before Implementation

The following business decisions affect database design and should be approved before coding begins:

1. Whether one branch may operate multiple warehouses and multiple POS terminals, and whether a terminal may switch warehouses during an open session.
2. Whether a warehouse maps to one cost/profit-centre pair or may inherit branch defaults with exceptions.
3. Whether purchases are posted on invoice approval, goods receipt, or both, and whether negative stock is ever permitted.
4. Whether staff authorization is based only on positions, only on explicit user permissions, or on both.
5. Whether the initial release supports one legal entity and one store only, while retaining a multi-branch data model from the beginning.
6. Which languages are required for user-facing localization, while retaining English as the mandatory developer and compilation language.

## 12. Recommended First Implementation Slice

The safest first slice is a small-shop pilot with one company, one branch, one active warehouse, one cost centre, one profit centre, one POS terminal, and two operating positions. It should deliver the readiness endpoint, explicit warehouse aggregate, POS terminal aggregate, branch-linked default context, warehouse-required purchase receipt, warehouse-driven sale, and startup readiness panel. This slice validates the architecture without prematurely attempting multi-company transfers, multi-currency settlement, advanced replenishment, or complex terminal replication.

Once this vertical slice passes all acceptance scenarios, the same operating-context contract can scale to multiple branches, warehouses, POS terminals, and more advanced inventory flows without changing the user’s conceptual model or the current architectural boundaries.
