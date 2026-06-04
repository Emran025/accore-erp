# accore Documentation Engine — Canonical Glossary

> **Purpose:** Every domain term used in AI-generated documentation MUST match the definitions below.
> **Rule:** If a term is not in this glossary, the AI MUST NOT use it without flagging `[ASSUMPTION]`.
> **Updates:** Only the Chief Architect may add or modify terms.
> **Term Count:** 53

---

## A

- **Account** — A record in the Chart of Accounts representing a financial category (asset, liability, equity, revenue, expense).
- **Action** — A single-responsibility PHP class that encapsulates one business operation (e.g., `CreateSalesInvoiceAction`). Part of the Action Layer pattern.
- **Accrual** — Recognition of revenue or expense before cash is exchanged.
- **Approval Workflow** — A state machine governing document transitions requiring human authorization.
- **Asset** — A resource with economic value owned by the organization, tracked through its lifecycle (acquisition, depreciation, disposal).
- **Audit Trail** — An immutable, chronological record of all system events for regulatory compliance.

## B

- **Batch** — A grouping of transactions processed together as a single unit (e.g., payroll batch, payment batch).
- **Bill of Materials (BOM)** — A structured list of raw materials, components, and quantities required to manufacture a product.
- **Bounded Context** — A DDD pattern defining the boundary within which a particular domain model applies. In accore, each Domain folder is a Bounded Context.
- **Budget** — A financial plan allocating expected revenue and expenses to Cost Centers or projects over a defined Fiscal Period.

## C

- **Chart of Accounts (COA)** — The complete hierarchical list of all financial accounts in the system.
- **Clearing** — The process of matching and settling offsetting debit and credit entries between accounts (e.g., AP clearing, AR clearing).
- **Cost Center** — An organizational unit to which costs are allocated for management accounting purposes.
- **Credit Limit** — The maximum amount of outstanding receivables allowed for a customer.

## D

- **Depreciation** — The systematic allocation of an asset's cost over its useful life, recorded as periodic journal entries.
- **Domain** — A Bounded Context in accore mapping to a folder under `backend/app/Domains/`.
- **Domain Event** — An event emitted when a significant business state change occurs within a Bounded Context.
- **Double-Entry Bookkeeping** — The foundational accounting principle: every transaction affects at least two accounts (debit and credit) that must balance.
- **DTO (Data Transfer Object)** — A structure for passing data between layers without business logic.
- **Dunning** — The process of systematically communicating with customers to collect overdue receivables.

## E

- **Entity** — A domain object with a unique identity that persists over time (e.g., `SalesInvoice`, `Employee`, `PurchaseOrder`).
- **Exchange Rate** — The ratio at which one currency can be converted to another, used in multi-currency transactions and revaluation.

## F

- **Fiscal Period** — A defined time interval (month/quarter/year) for financial reporting. Periods can be locked or closed.
- **Frontmatter** — YAML metadata at the top of a Markdown document (between `---` markers).
- **Freeze** — The state of a domain or task that prevents any AI modification until explicitly unfrozen.

## G

- **General Ledger (GL)** — The central repository of all financial transactions in the ERP.
- **Goods Movement** — A warehouse event recording the physical receipt, issue, or transfer of inventory items.

## I

- **Idempotency** — The property ensuring that an operation produces the same result regardless of how many times it is executed.
- **Immutability** — The principle that posted financial records cannot be modified or deleted; corrections are made via offset entries.
- **Integration Event** — A domain event that crosses Bounded Context boundaries to trigger actions in another domain.
- **Integration Hub** — The platform subsystem responsible for managing external connections, webhooks, and API gateway routing.

## J

- **Journal Entry** — A record of a financial transaction in the General Ledger, consisting of balanced debit and credit lines.

## L

- **Lifecycle** — The sequential states a business document passes through (e.g., Draft → Submitted → Approved → Posted → Closed).
- **Localization (i18n)** — The adaptation of documentation and system interfaces for specific languages or regions (e.g., Arabic for MENA).

## M

- **Master Data** — Persistent reference data (customers, vendors, products, accounts) that changes infrequently.
- **Multi-Tenancy** — Architecture supporting multiple isolated organizations within a single application instance.

## O

- **Offset Entry** — A corrective journal entry that reverses or adjusts a previously posted transaction without modifying the original record.

## P

- **Page** — The atomic unit of documentation output (~600 words, max 650).
- **Posting** — The irreversible act of recording a financial transaction in the General Ledger.
- **Purchase Order (PO)** — A formal document issued to a vendor authorizing the procurement of goods or services.

## Q

- **Quality Inspection** — A manufacturing process step that validates produced goods against defined tolerances and standards.

## R

- **RBAC (Role-Based Access Control)** — Authorization model where permissions are assigned to roles, not individual users.
- **Reconciliation** — The process of verifying that two sets of records (e.g., bank statement vs. GL) are in agreement.

## S

- **Sales Invoice** — A financial document issued to a customer recording a completed sale and establishing an accounts receivable obligation.
- **Service** — A class providing reusable business logic consumed by Actions. Services do not handle HTTP concerns.
- **State Machine** — A formal model defining the valid states and transitions of a business document.
- **Subdomain** — A subdivision within a Domain (e.g., `GeneralLedger` within `Finance`).

## T

- **Task** — The smallest executable unit in the doc-engine, defined by a `.task.md` file.
- **Template** — An immutable Markdown structure file that controls the sections and headings of a documentation output.
- **Tenant** — An isolated organizational unit within the multi-tenant system, typically representing a single company or business entity.
- **Tier** — One of five documentation classification layers (System, Architecture, API, Developer, Operations).
- **Trial Balance** — A report listing all account balances to verify debits equal credits.

## U

- **Universal Journal** — The unified transaction journal that consolidates all financial postings across modules into a single ledger.

## V

- **Value Object** — An immutable object defined by its attributes (e.g., `Money`, `Currency`), not by identity.

## W

- **WBS (Work Breakdown Structure)** — A hierarchical decomposition of project deliverables into manageable work packages.
- **Webhook** — An HTTP callback triggered by a domain event, enabling external system integration.
- **Work Order** — A manufacturing instruction authorizing the production of a specified quantity of a product using a defined BOM and routing.

---

> **Expansion Note:** This glossary will grow as new domains are documented.
> Each Phase should add domain-specific terms before task execution begins.

