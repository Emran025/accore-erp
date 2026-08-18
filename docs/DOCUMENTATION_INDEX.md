# Documentation Index - accore ERP System

> **Complete Documentation Suite for Enterprise Resource Planning System**
> **Version:** 3.1 | **Last Updated:** August 18, 2026

Welcome to the comprehensive documentation for the accore ERP System. This index provides quick access to all documentation resources for our enterprise-grade ERP solution.

---

## 📚 Documentation Structure

The documentation is organized into a **domain-driven hierarchy** with six top-level categories:

### 1. Architecture (`docs/Architecture/`)

Core system design patterns and technical philosophy:

- **[Domain Driven Design in Laravel](./Architecture/Domain_Driven_Design_In_Laravel.md)** — Bounded Context design and DDD patterns
- **[Action and Service Layer](./Architecture/Action_And_Service_Layer.md)** — Actions pattern and service encapsulation
- **[Frontend Backend Separation](./Architecture/Frontend_Backend_Separation.md)** — API contract and decoupling strategy
- **[Event Bus and Domain Events](./Architecture/Event_Bus_And_Domain_Events.md)** — Event-driven architecture
- **[Transaction Management and Idempotency](./Architecture/Transaction_Management_And_Idempotency.md)** — Financial transaction safety
- **[Multi-Tenancy Architecture](./Architecture/Multi_Tenancy_Architecture.md)** — Tenant isolation design
- **[ADR-004: Self-Contained Distribution Platform](./Architecture/ADR-004-accore-self-contained-distribution-platform.md)** — Server/Client product flavours and supported-platform boundary
- **[ADR-005: Private AccoreDB Runtime](./Architecture/ADR-005-accoredb-private-runtime.md)** — Database isolation, persistent data, upgrade, and restore boundary
- **[ADR-006: Client–Server Trust](./Architecture/ADR-006-client-server-trust-and-network-boundary.md)** — Pairing, TLS, device enrolment, and network exposure policy
- **[ADR-007: Release Signing and Server Lifecycle](./Architecture/ADR-007-release-signing-service-lifecycle-and-recovery.md)** — Service authority, signed releases, migration, and recovery policy
- **User Experience** — [Philosophy](./Architecture/UserExperience/01_Philosophy_and_Vision.md) | [Shell](./Architecture/UserExperience/02_Shell_Architecture.md) | [Domains](./Architecture/UserExperience/03_Enterprise_Domain_Map.md) | [Visual](./Architecture/UserExperience/04_Visual_Design_System.md) | [Technical](./Architecture/UserExperience/05_Technical_Implementation.md)

### 2. API (`docs/API/`)

API contracts, security, and integration:

- **[API Philosophy and Versioning](./API/API_Philosophy_And_Versioning.md)** — Versioning strategy and design principles
- **[Authentication and Authorization Contracts](./API/Authentication_And_Authorization_Contracts.md)** — Auth flow and token management
- **[Rate Limiting and Security](./API/Rate_Limiting_And_Security.md)** — Throttling and protection
- **[External System Integrations](./API/External_System_Integrations.md)** — Third-party integration patterns
- **[Webhook Dispatching](./API/Webhook_Dispatching.md)** — Event notification system

### 3. Domains (`docs/Domains/`)

Business logic documentation organized by bounded context (11 domains):

| Domain | Overview | Key Topics |
| ------ | -------- | ---------- |
| **EnterpriseCore** | [Overview](./Domains/EnterpriseCore/Overview.md) | Auth & Permissions, Identity Access, Automation, Organization Governance, Monitoring |
| **Commercial** | [Overview](./Domains/Commercial/Overview.md) | CRM, Sales Lifecycle, Revenue & Receivables, Marketing & Distribution |
| **Finance** | [Overview](./Domains/Finance/Overview.md) | General Ledger, Tax Compliance, Treasury, Foreign Exchange, Audit |
| **SupplyChain** | [Overview](./Domains/SupplyChain/Overview.md) | Inventory, Procurement, Payables & Expenses, Supplier Sourcing |
| **HumanCapital** | [Overview](./Domains/HumanCapital/Overview.md) | Workforce Admin, Payroll & Benefits, Talent, Performance, Wellness |
| **Manufacturing** | [Overview](./Domains/Manufacturing/Overview.md) | Production Control, Engineering, Quality Control |
| **Projects** | [Overview](./Domains/Projects/Overview.md) | Planning, Execution Tracking, Project Finance |
| **Assets** | [Overview](./Domains/Assets/Overview.md) | Asset Lifecycle, Investments |
| **Intelligence** | [Overview](./Domains/Intelligence/Overview.md) | Business Intelligence, Advanced Analytics |
| **Platform** | [Overview](./Domains/Platform/Overview.md) | Integration Hub, Customization, Communication |
| **Shared** | — | Cross-domain utilities and shared services |

Each domain subdirectory contains:
- **business logic** documents (workflows, processes, policies)
- **database_Schema.md** files (Mermaid ER diagrams + data dictionaries)

### 4. Developer (`docs/Developer/`)

Guides for engineers contributing to the project:

- **[Onboarding Guide](./Developer/Onboarding_Guide.md)** — Getting started for new developers
- **[Creating a New Module](./Developer/Creating_A_New_Module.md)** — Step-by-step module creation
- **[Testing Strategy and Factories](./Developer/Testing_Strategy_And_Factories.md)** — PHPUnit patterns and factories
- **[Writing Financial Migrations](./Developer/Writing_Financial_Migrations.md)** — Migration best practices
- **[Handling Master Data](./Developer/Handling_Master_Data.md)** — Seeding and reference data
- **Report Template Editor** — [Overview](./Developer/ReportTemplateEditor/index.md) | [Architecture](./Developer/ReportTemplateEditor/architecture.md) | [Integration](./Developer/ReportTemplateEditor/integration.md) | [AI & Automation](./Developer/ReportTemplateEditor/ai-automation.md)

### 5. Operations (`docs/Operations/`)

Production deployment and governance:

- **[Deployment Strategy](./Operations/Deployment_Strategy.md)** — Production deployment procedures
- **[Database Backup and Recovery](./Operations/Database_Backup_And_Recovery_Policies.md)** — Backup policies
- **[Audit Trails and Security Logging](./Operations/Audit_Trails_And_Security_Logging.md)** — Compliance logging
- **[Production Environment Governance](./Operations/Production_Environment_Governance.md)** — Environment management
- **[Post Closure Financial Discrepancies](./Operations/Post_Closure_Financial_Discrepancies.md)** — Period closure handling
- **[Accore Server Lifecycle and Recovery Policy](./Operations/Accore_Server_Lifecycle_And_Recovery_Policy.md)** — Service ownership, health gates, backups, and recovery actions
- **[Accore Server and Client Distribution Plan](./Operations/Accore_Server_Client_Distribution_Plan.md)** — Proposed self-contained distribution architecture
- **[Accore Distribution GitHub Issues](./Operations/Accore_Distribution_GitHub_Issues.md)** — Delivery epic and linked implementation work

### 6. System (`docs/System/`)

Core business rules and strategic documentation:

- **[ERP Philosophy and Vision](./System/ERP_Philosophy_And_Vision.md)** — System design principles
- **[Bounded Context Map](./System/Bounded_Context_Map.md)** — Domain relationship map
- **[Core Business Assumptions](./System/Core_Business_Assumptions.md)** — Foundational business rules
- **[Cross Domain Integration Patterns](./System/Cross_Domain_Integration_Patterns.md)** — Inter-domain communication
- **[Financial Data Immutability](./System/Financial_Data_Immutability.md)** — Ledger integrity rules

### Legacy Documents

- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** — Comprehensive technical reference (maintained for backward compatibility)
- **[USER_GUIDE.md](./USER_GUIDE.md)** ⭐ — Bilingual user manual (Arabic/English) for non-technical users

---

## 🚀 Quick Navigation

### For New Developers

1. Read [README.md](./../README.md) — 5 minutes
2. Follow installation steps
3. Review [Developer/Onboarding_Guide.md](./Developer/Onboarding_Guide.md)
4. Explore [Domains/](./Domains/) to understand data models

### For Backend Developers

1. [Architecture/Domain_Driven_Design_In_Laravel.md](./Architecture/Domain_Driven_Design_In_Laravel.md)
2. [Architecture/Action_And_Service_Layer.md](./Architecture/Action_And_Service_Layer.md)
3. Domain-specific docs in [Domains/](./Domains/)
4. [API/](./API/) for API contracts

### For Frontend Developers

1. [Architecture/Frontend_Backend_Separation.md](./Architecture/Frontend_Backend_Separation.md)
2. [Architecture/UserExperience/](./Architecture/UserExperience/) for UX system
3. [API/](./API/) for API integration

### For System Architects

1. [System/ERP_Philosophy_And_Vision.md](./System/ERP_Philosophy_And_Vision.md)
2. [System/Bounded_Context_Map.md](./System/Bounded_Context_Map.md)
3. [Architecture/](./Architecture/) for all design patterns

### For DevOps / Deployment

1. [Operations/Deployment_Strategy.md](./Operations/Deployment_Strategy.md)
2. [Operations/Production_Environment_Governance.md](./Operations/Production_Environment_Governance.md)
3. [Operations/Database_Backup_And_Recovery_Policies.md](./Operations/Database_Backup_And_Recovery_Policies.md)

---

## 📦 ERP Module Documentation

### Business Modules

| Module | User Guide | Domain Docs |
| ------ | ---------- | ----------- |
| **Sales & POS** | [User Guide](./USER_GUIDE.md#1--وحدة-المبيعات-والفواتير--sales--invoicing-module) | [Commercial/SalesLifecycle](./Domains/Commercial/SalesLifecycle/) |
| **Purchases** | [User Guide](./USER_GUIDE.md#2--وحدة-المشتريات-والمصروفات--purchases--expenses-module) | [SupplyChain/Procurement](./Domains/SupplyChain/Procurement/) |
| **Inventory** | [User Guide](./USER_GUIDE.md#3--وحدة-المخزون-والمنتجات--inventory--products-module) | [SupplyChain/Inventory](./Domains/SupplyChain/Inventory/) |
| **AR (Customers)** | [User Guide](./USER_GUIDE.md#4--وحدة-العملاء-والذمم-المدينة--customers--ar-module) | [Commercial/CRM](./Domains/Commercial/CRM/) |
| **AP (Suppliers)** | [User Guide](./USER_GUIDE.md#5--وحدة-الموردين-والذمم-الدائنة--suppliers--ap-module) | [SupplyChain/PayablesExpenses](./Domains/SupplyChain/PayablesExpenses/) |
| **General Ledger** | [User Guide](./USER_GUIDE.md#6--وحدة-الدفتر-العام--general-ledger-module) | [Finance/GeneralLedger](./Domains/Finance/GeneralLedger/) |
| **Financial Reports** | [User Guide](./USER_GUIDE.md#7--وحدة-التقارير-المالية--financial-reports-module) | [Intelligence/BusinessIntelligence](./Domains/Intelligence/) |
| **HR & Payroll** | [User Guide](./USER_GUIDE.md#8--وحدة-الموارد-البشرية-والرواتب--hr--payroll-module) | [HumanCapital/](./Domains/HumanCapital/) |
| **Fixed Assets** | [User Guide](./USER_GUIDE.md#9-️-وحدة-الأصول-الثابتة--fixed-assets-module) | [Assets/AssetLifecycle](./Domains/Assets/AssetLifecycle/) |
| **Multi-Currency** | [User Guide](./USER_GUIDE.md#10--وحدة-العملات-المتعددة--multi-currency-module) | [Finance/ForeignExchange](./Domains/Finance/ForeignExchange/) |
| **Tax Engine** | [User Guide](./USER_GUIDE.md#11--نظام-الضرائب--tax-engine) | [Finance/TaxCompliance](./Domains/Finance/TaxCompliance/) |
| **Number Ranges** | [User Guide](./USER_GUIDE.md#12--نظام-الترقيم--number-ranges) | [EnterpriseCore/SystemOverview](./Domains/EnterpriseCore/SystemOverview/) |
| **Auth & Permissions** | [User Guide](./USER_GUIDE.md#الأدوار-والصلاحيات) | [EnterpriseCore/AuthPermissions](./Domains/EnterpriseCore/AuthPermissions/) |
| **Report Editor** | [User Guide](./USER_GUIDE.md#نظام-قوالب-التقارير) | [Developer/ReportTemplateEditor](./Developer/ReportTemplateEditor/) |

---

## 📊 Statistics

### Documentation Coverage

- **Total Documentation Files:** 80+ markdown files across 6 categories
- **Bounded Contexts Documented:** 11/11 (100%)
- **Database Schemas:** Auto-generated per domain with Mermaid ER diagrams
- **Code Examples:** 100+ snippets

### Codebase Metrics

**Backend:**

- Laravel 12, PHP 8.2+
- 11 Bounded Contexts (DDD)
- 81+ database migrations
- 77 domain-organized controllers
- 42 Model directories (distributed across domains)
- Actions Pattern for business logic

**Frontend:**

- Next.js 16, React 19, TypeScript 5
- 10 domain routing directories + auth + navigation
- 6 component categories (ui, navigation, template-editor, number-range, tax, layout)
- 13 Zustand state stores
- ~128KB design system (globals.css)

---

## 📝 Documentation Standards

All documentation follows these principles:

- **Domain-Driven:** Organized by bounded context
- **Accurate:** Auto-generated schemas from live database
- **Practical:** Includes examples and use cases
- **Searchable:** Clear headers and structure
- **Bilingual:** User Guide in Arabic & English
- **Versioned:** Dated and version-tracked

---

## 🗺️ Visual Documentation Map

```txt
accore/
│
├── 📄 README.md
│   ├─► Quick Start
│   ├─► ERP Module Overview
│   └─► Installation
│
├── 🤝 CONTRIBUTING.md
│   └─► Contribution Guidelines
│
└── docs/
    │
    ├── 🏛️ Architecture/
    │   ├─► Domain Driven Design in Laravel
    │   ├─► Action and Service Layer
    │   ├─► Frontend Backend Separation
    │   ├─► Event Bus and Domain Events
    │   ├─► Transaction Management
    │   ├─► Multi-Tenancy Architecture
    │   └─► UserExperience/ (5 docs)
    │
    ├── 🔌 API/
    │   ├─► API Philosophy and Versioning
    │   ├─► Auth and Authorization Contracts
    │   ├─► Rate Limiting and Security
    │   ├─► External System Integrations
    │   └─► Webhook Dispatching
    │
    ├── 📦 Domains/ (11 Bounded Contexts)
    │   ├─► EnterpriseCore/ (Auth, Identity, Automation, Governance)
    │   ├─► Commercial/ (CRM, Sales, Revenue, Marketing)
    │   ├─► Finance/ (GL, Tax, Treasury, FX, Audit)
    │   ├─► SupplyChain/ (Inventory, Procurement, AP)
    │   ├─► HumanCapital/ (9 subdomain areas)
    │   ├─► Manufacturing/ (Production, Engineering, QC)
    │   ├─► Projects/ (Planning, Execution, Finance)
    │   ├─► Assets/ (Lifecycle, Investments)
    │   ├─► Intelligence/ (BI, Analytics)
    │   ├─► Platform/ (Integration, Customization)
    │   └─► Shared/ (Cross-domain utilities)
    │
    ├── 👨‍💻 Developer/
    │   ├─► Onboarding Guide
    │   ├─► Creating a New Module
    │   ├─► Testing Strategy
    │   ├─► Writing Financial Migrations
    │   ├─► Handling Master Data
    │   └─► ReportTemplateEditor/ (4 docs)
    │
    ├── ⚙️ Operations/
    │   ├─► Deployment Strategy
    │   ├─► Database Backup and Recovery
    │   ├─► Audit Trails and Security
    │   ├─► Production Governance
    │   └─► Post-Closure Discrepancies
    │
    ├── 🧠 System/
    │   ├─► ERP Philosophy and Vision
    │   ├─► Bounded Context Map
    │   ├─► Core Business Assumptions
    │   ├─► Cross-Domain Integration
    │   └─► Financial Data Immutability
    │
    ├── 📖 USER_GUIDE.md (العربية/English)
    ├── 📘 TECHNICAL_DOCUMENTATION.md
    └── 📑 DOCUMENTATION_INDEX.md (this file)
```

---

## 📋 Checklist for New Team Members

- [ ] Read README.md (5 minutes)
- [ ] Complete local setup (10 minutes)
- [ ] Review [Developer/Onboarding_Guide.md](./Developer/Onboarding_Guide.md) (15 minutes)
- [ ] Understand ERP modules in [USER_GUIDE.md](./USER_GUIDE.md) (30 minutes)
- [ ] Browse domain overviews in [Domains/](./Domains/) (20 minutes)
- [ ] Run the application locally
- [ ] Make a test API call
- [ ] Review codebase structure
- [ ] Read your role-specific documentation section
- [ ] Set up development environment

**Estimated Time:** 2-3 hours total

---

## 🔄 Documentation Updates

**Last Updated:** March 28, 2026
**Version:** 3.0
**Codebase Version:** Laravel 12 + Next.js 16

### Update Policy

Documentation should be updated when:

- New features are added
- Major refactoring occurs
- API contracts change
- Database schema changes
- ERP workflows change
- Deployment procedures change

---

**Start your journey with [README.md](./../README.md) →**
