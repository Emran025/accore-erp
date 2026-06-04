# accore ERP System - Technical Documentation

> **Last Updated:** March 28, 2026  
> **Version:** 3.0  
> **Architecture:** Monorepo (Laravel Backend + Next.js Frontend) — Domain-Driven Design  
> **System Type:** Enterprise Resource Planning (ERP)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [User Experience & UI Architecture](#3-user-experience--ui-architecture)
4. [Backend Documentation (`/backend`)](#4-backend-documentation-backend)
5. [Frontend Documentation (`/frontend`)](#5-frontend-documentation-frontend)
6. [Database Schema & Models](#6-database-schema--models)
7. [API Surface & Contracts](#7-api-surface--contracts)
8. [Business Logic & Services](#8-business-logic--services)
9. [Security & Authentication](#9-security--authentication)
10. [Developer Onboarding](#10-developer-onboarding)
11. [Troubleshooting & Common Issues](#11-troubleshooting--common-issues)
12. [Deployment Guide](#12-deployment-guide)

---

## 1. System Overview

### 1.1 What is accore ERP?

**accore ERP** is an enterprise-grade **Enterprise Resource Planning (ERP)** system designed for small to medium-sized businesses. It integrates all core business functions—Sales, Purchases, Inventory, Finance, HR, and Payroll—into a unified platform with real-time data synchronization and automatic ledger postings.

### 1.2 High-Level Architecture

This is a **full-featured ERP system** built as a **monorepo** containing:

```txt
┌────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                         │
│          (Next.js 16 - React 19 - TypeScript)              │
│                      Port: 5000                            │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTP/JSON API
                           │ (RESTful)
┌──────────────────────────▼─────────────────────────────────┐
│              LARAVEL BACKEND API                           │
│           (Laravel 12 - PHP 8.2+)                          │
│                  Port: 8000                                │
├────────────────────────────────────────────────────────────┤
│      Controllers → Requests → Actions → Services           │
│      → Models → Database → Resources                       │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│              MySQL DATABASE                                │
│        (Production: MySQL/PostgreSQL)                      │
└────────────────────────────────────────────────────────────┘
```

### 1.3 Core ERP Modules

The system implements a comprehensive ERP solution organized into **10 enterprise domains**:

| # | Domain | Description | Key Features |
| - | ------ | ----------- | ------------ |
| 1 | **Enterprise Core** | Base governance & security | RBAC, System settings, Number ranges |
| 2 | **Commercial** | Sales operations | POS, Invoicing, CRM, ZATCA e-invoicing |
| 3 | **Finance** | Core accounting | General Ledger, Chart of accounts, Tax compliance |
| 4 | **Supply Chain** | Goods movement | Inventory (FIFO/Average), Procurement, Payables |
| 5 | **Manufacturing** | Production management | Production control, Bill of Materials, QC |
| 6 | **Human Capital** | Workforce management | 20+ modules: Employees, Payroll, Approvals |
| 7 | **Projects** | Project tracking | Project finance, Execution tracking |
| 8 | **Assets** | Fixed assets | Depreciation schedules (SL/DB), Lifecycles |
| 9 | **Intelligence** | Analytics & Reporting | Balance Sheet, P&L, BI dashboards |
| 10 | **Platform** | Integrations | Communication, Extensibility hub |

> **Note:** For deep architectural documentation on each domain, see `docs/Domains/`.

### 1.4 Integration Points

- **Frontend ↔ Backend:** REST API over HTTP (`/api/*` endpoints)
- **Authentication:** Session-based with token headers (`X-Session-Token`)
- **CORS:** Configured for local development (localhost:3000 ↔ localhost:8000)
- **Data Format:** JSON (request/response)
- **File Uploads:** Multipart form data (employee documents)

---

## 2. Architecture & Technology Stack

### 2.1 Backend Stack (`/backend`)

| Component | Technology | Version |
| ----------- | ----------- | --------- |
| **Framework** | Laravel | 12.x |
| **Language** | PHP | 8.2+ |
| **Database** | MySQL (dev) / MySQL (prod) | - |
| **ORM** | Eloquent | Built-in |
| **Queue** | Database driver | Built-in |
| **Cache** | Database driver | Built-in |
| **Session** | Database driver | Built-in |
| **Validation** | Form Requests | Built-in |
| **Testing** | PHPUnit | 11.x |

**Design Patterns:**

- **Domain-Driven Design** (11 Bounded Contexts under `app/Domains/`)
- **Actions Pattern** (Single-responsibility action classes for business operations)
- **Service Layer Pattern** (Business logic encapsulation within domains)
- **Contracts** (Domain interfaces under `app/Contracts/`)
- **Policies** (Authorization policies under `app/Policies/`)
- **Enums** (Type-safe enumerations under `app/Enums/`)
- **Form Request Validation** (Strict input validation and sanitization)
- **Middleware Pipeline** (Authentication, CORS, Permission enforcement)

### 2.2 Frontend Stack (`/frontend`)

| Component | Technology | Version |
| ----------- | ----------- | --------- |
| **Framework** | Next.js (App Router) | 16.1.1 |
| **Language** | TypeScript | 5.x |
| **UI Library** | React | 19.2.3 |
| **Styling** | Tailwind CSS | 4.x |
| **State Management** | React Hooks (useState, useEffect) | - |
| **HTTP Client** | Native Fetch API | - |
| **Routing** | File-based (Next.js App Router) | - |
| **QR Code** | qrcode.js | 1.5.4 |

**Architecture Pattern:**

- **App Router** (Server & Client Components)
- **Component-based Architecture** (Reusable UI components)
- **Modular Logic Pattern** (Large pages decomposed into: `types.ts`, `useModule.ts` hook, and the main `page.tsx`)
- **Custom Hooks** for reusable state and API interaction logic
- **Utility Functions** for shared operations (Currency, Dates, Auth)

### 2.3 Directory Structure

```txt
accore/
├── backend/                              # Laravel 12 Enterprise API
│   ├── app/
│   │   ├── Domains/                      # 11 Bounded Contexts (DDD)
│   │   │   ├── Assets/                   # Asset Lifecycle & Investments
│   │   │   ├── Commercial/               # CRM, Sales, Revenue, Marketing
│   │   │   ├── EnterpriseCore/           # Identity, Automation, Governance
│   │   │   ├── Finance/                  # GL, Tax, Treasury, FX, Audit
│   │   │   ├── HumanCapital/             # Workforce, Payroll, Talent, Wellness
│   │   │   ├── Intelligence/             # BI & Advanced Analytics
│   │   │   ├── Manufacturing/            # Production, Engineering, QC
│   │   │   ├── Platform/                 # Integration Hub, Customization
│   │   │   ├── Projects/                 # Planning, Execution, Finance
│   │   │   ├── Shared/                   # Cross-domain utilities
│   │   │   └── SupplyChain/              # Inventory, Procurement, AP
│   │   ├── Contracts/                    # Domain Interfaces
│   │   ├── Enums/                        # System Enumerations
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V2/       # 77 Domain-Organized Controllers
│   │   │   ├── Middleware/               # Security & Auth (ApiAuth)
│   │   │   └── Requests/                 # Strict Validation Logic
│   │   ├── Policies/                     # Authorization Policies
│   │   ├── Jobs/                         # Background Jobs
│   │   └── Helpers/                      # Core System Helpers
│   ├── database/
│   │   ├── migrations/                   # 81+ Schema Definitions
│   │   ├── seeders/                      # Data Seeders
│   │   └── factories/                    # Model Factories
│   ├── routes/
│   │   ├── api.php                       # Primary API Registry
│   │   └── console.php                   # System Commands
│   ├── config/                           # Application Configuration
│   └── storage/                          # Persistent Assets & Logs
│
└── frontend/                             # Next.js 16 Precision Frontend
    ├── app/                              # Domain-Driven Modular Routing
    │   ├── 01-enterprise-core/           # Identity & Governance
    │   ├── 02-commercial/                # Sales & Revenue
    │   ├── 03-finance/                   # Ledger & Treasury
    │   ├── 04-supply-chain/              # Inventory & AP
    │   ├── 05-manufacturing/             # Production Control
    │   ├── 06-human-capital/             # Payroll & Workforce
    │   ├── 07-projects/                  # Project Execution
    │   ├── 08-assets/                    # Asset Lifecycle
    │   ├── 09-intelligence/              # Analytics & BI
    │   ├── 10-platform/                  # Extension Hub
    │   ├── auth/                         # Authentication Guard
    │   └── navigation/                   # Shell Matrix
    ├── components/                       # Component Library
    │   ├── ui/                           # Base UI Components
    │   ├── navigation/                   # Shell Pillar Components
    │   ├── template-editor/              # Advanced Report Architect
    │   ├── number-range/                 # Numbering Engine UI
    │   ├── tax/                          # Tax Engine Components
    │   └── layout/                       # Layout Components
    ├── stores/                           # Global State (Zustand - 13 stores)
    ├── lib/                              # API, Auth, Utils, Endpoints
    └── public/                           # Static Assets & Media
```

---

## 3. User Experience & UI Architecture

accore ERP utilizes a proprietary UX framework designed for high-density enterprise operations. The system is built on a **Domain-Driven, Capability-Oriented** model.

### 3.1 Design Philosophy
The platform follows a "Wide but Shallow" hierarchy to ensure all functional screens are accessible within **3 clicks**. This is inspired by modern IDEs like VS Code, prioritizing a "state of flow" for power users.

- **The 4-Layer Taxonomy:** Domain → Capability → Feature Group → Screen.
- **Zero-Borders Policy:** Separation of concerns is achieved through depth and color rather than explicit lines.
- **Visual Discipline:** Sharp corners (Zero Radius) and high information density.

### 3.2 Shell Components
The system's outer shell consists of four permanent architectural pillars:
1. **SideNavigationBar:** Manages the system map and favorite screens.
2. **TopGlobalBar:** Holds global system menus and mental anchoring (Screen Title).
3. **SearchNavigationBar:** Provides interactive breadcrumbs and a multi-layer command palette.
4. **StatusNotificationBar:** A non-intrusive feedback layer at the foot of the system.

### 3.3 The 10-Domain Map
The codebase and UI are strictly divided into 10 enterprise domains:
1. Core, 2. Commercial, 3. Finance, 4. Supply Chain, 5. Manufacturing, 6. Human Capital, 7. Projects, 8. Assets, 9. Intelligence, 10. Digital Platform.

### 3.4 Detailed UX Documentation
For complete details on iconography, color layering, and technical configuration, refer to the dedicated UX documentation:
- [UX Philosophy & Vision](./Architecture/UserExperience/01_Philosophy_and_Vision.md)
- [Shell Architecture](./Architecture/UserExperience/02_Shell_Architecture.md)
- [Enterprise Domain Map](./Architecture/UserExperience/03_Enterprise_Domain_Map.md)
- [Visual Design System](./Architecture/UserExperience/04_Visual_Design_System.md)
- [Technical Implementation](./Architecture/UserExperience/05_Technical_Implementation.md)

---

## 4. Backend Documentation (`/backend`)

### 4.1 Prerequisites

- **PHP:** Version 8.2 or higher
- **Composer:** Latest version
- **Extensions Required:**
  - `php-mysql` (production)
  - `php-mbstring`
  - `php-xml`
  - `php-bcmath`
  - `php-json`
  - `php-curl`

### 4.2 Installation & Setup

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed the database (optional)
php artisan db:seed

# Link storage
php artisan storage:link
```

### 4.3 Environment Configuration

Key `.env` variables:

```env
APP_NAME="Accounting System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database

# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=accounting
# DB_USERNAME=root
# DB_PASSWORD=

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# CORS (for frontend)
FRONTEND_URL=http://localhost:3000
```

### 4.4 Running the Backend

**Development Mode:**

```bash
# Standard server
php artisan serve
# Runs on http://localhost:8000

# Or with custom scripts (runs all services):
composer dev
# Starts: API server, Queue worker, Pail logs, Vite
```

**Queue Worker** (for background jobs):

```bash
php artisan queue:listen
```

### 4.5 Key Controllers

Located in `backend/app/Http/Controllers/Api/V2/` — organized by domain:

| Domain | Controllers | Purpose |
| ------ | ----------- | ------- |
| **EnterpriseCore/IdentityAccess** | `AuthController`, `UsersController`, `RolesController`, `SessionsController`, `PermissionTemplateController` | Authentication, users, roles, sessions |
| **EnterpriseCore/OrganizationGovernance** | `SettingsController`, `AuditLogController`, `AuditTrailController`, `ComplianceProfileController`, `OrgStructureController` | Settings, audit, compliance, org structure |
| **EnterpriseCore/SystemOverview** | `NumberRangeController` | Enterprise numbering engine |
| **EnterpriseCore/Automation** | `SystemTemplateController` | Automation templates |
| **Commercial/SalesLifecycle** | `SalesController`, `SalesReturnController`, `ServiceController`, `ServiceSaleController` | Sales, returns, service invoicing |
| **Commercial/CRM** | `ArController` | Customer management & AR |
| **Commercial/MarketingDistribution** | `SalesRepresentativeController` | Sales representative management |
| **Commercial/RevenueReceivables** | `ArTransactionsController` | AR transaction management |
| **Finance/GeneralLedger** | `GeneralLedgerController`, `ChartOfAccountsController`, `FiscalPeriodsController`, `RecurringTransactionsController` | GL operations, CoA, fiscal periods |
| **Finance/TaxCompliance** | `TaxEngineController`, `ZATCAInvoiceController` | Tax calculation, ZATCA e-invoicing |
| **Finance/Treasury** | `JournalVouchersController`, `BankReconciliationController` | Journal vouchers, bank reconciliation |
| **Finance/ForeignExchange** | `CurrencyController`, `CurrencyPolicyController` | Multi-currency management |
| **Finance/ManagementAccounting** | `ExpensesController`, `RevenuesController`, `CostProfitCenterController` | Expenses, revenues, cost centers |
| **SupplyChain/Inventory** | `ProductsController`, `InventoryCountController`, `ConsumptionsController` | Product & stock management |
| **SupplyChain/Procurement** | `PurchasesController`, `PurchaseRequestController` | Purchasing & requisitions |
| **SupplyChain/PayablesExpenses** | `ApController`, `ApTransactionsController` | Supplier management & AP |
| **HumanCapital/WorkforceAdmin** | `EmployeesController`, `DepartmentsController` | HR & departments |
| **HumanCapital/PayrollBenefits** | `PayrollController`, `PayrollComponentsController`, `CompensationController`, `EOSBController`, `PostPayrollController` | Payroll processing & benefits |
| **HumanCapital/PerformanceDevelopment** | `PerformanceController`, `LearningController`, `SuccessionController` | Performance reviews & learning |
| **HumanCapital/ServicesWellness** | `EhsController`, `EmployeeLoansController`, `TravelExpenseController` | Employee services & wellness |
| **Assets** | `AssetsController`, `EmployeeAssetsController` | Fixed asset lifecycle |
| **Intelligence** | `ReportsController`, `AnalyticsController` | Financial reports & analytics |

### 4.6 Service & Action Layer

Services and Actions are distributed within each bounded context under `backend/app/Domains/`:

| Domain Path | Key Services & Actions |
| ----------- | ---------------------- |
| `Domains/Commercial/SalesLifecycle/` | `SalesService`, `ServiceSaleService`, `CreateInvoiceAction`, `DeleteInvoiceAction`, `CreateSalesReturnAction` |
| `Domains/Commercial/CRM/` | `CreateCustomerAction`, `CustomerLedgerAction`, `DeleteCustomerAction` |
| `Domains/Finance/GeneralLedger/` | `LedgerService` (GL posting, voucher numbering, trial balance) |
| `Domains/Finance/TaxCompliance/` | `TaxCalculator`, `ZATCATaxAuthority` |
| `Domains/SupplyChain/Inventory/` | `InventoryCostingService`, product actions |
| `Domains/Assets/AssetLifecycle/` | `DepreciationService`, asset CRUD actions |
| `Domains/HumanCapital/WorkforceAdmin/` | Employee management actions |
| `Domains/HumanCapital/PayrollBenefits/` | Payroll generation, approval, payment actions |
| `Domains/EnterpriseCore/IdentityAccess/` | Auth service, permission management |
| `Domains/EnterpriseCore/Automation/` | Batch processing actions |

Each domain subdirectory follows the pattern:
```
Domains/{Context}/{Subdomain}/
├── Actions/       # Single-responsibility operations
├── Models/        # Eloquent entities for this subdomain
└── Services/      # Complex business logic orchestration
```

### 4.7 Custom Artisan Commands

```bash
# Setup script (runs all setup steps)
composer run setup

# Development environment
composer run dev

# Run tests
composer run test
```

### 4.8 Middleware

Located in `backend/app/Http/Middleware/`:

- **`ApiAuth.php`**: Session-based authentication for API routes
  - Checks for `X-Session-Token` header or session token
  - Validates against `sessions` table
  - Sets authenticated user in Laravel's auth system

---

## 5. Frontend Documentation (`/frontend`)

### 5.1 Prerequisites

- **Node.js:** Version 20.x or higher
- **npm:** Version 10.x or higher

### 5.2 Installation & Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 5.3 Configuration

The frontend needs to know where the backend API is located:

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
```

**Important:** This environment variable is hardcoded in `lib/api.ts` with a fallback.

### 5.4 Running the Frontend

```bash
# Development server
npm run dev
# Runs on http://localhost:3000

# Production build
npm run build
npm start

# Linting
npm run lint
```

### 5.5 Routing Structure

Next.js **App Router** (file-based routing):

| Route | Page | Description |
| ------- | ------ | ------------- |
| `/auth/login` | Login | Authentication Guard |
| `/01-enterprise-core/system-overview/dashboard` | Dashboard | Global KPI & Shell Entry |
| `/01-enterprise-core/organization-governance/settings` | Settings | System Configuration |
| `/02-commercial/sales-lifecycle/direct-sales` | Sales | POS & Inventory Integration |
| `/03-finance/general-ledger/view` | General Ledger | Accounting Core |
| `/03-finance/tax-compliance/zatca` | Tax Engine | ZATCA/Regulatory Hub |
| `/04-supply-chain/inventory/products` | Products | Catalog & Stock Control |
| `/04-supply-chain/payables-expenses/suppliers` | Suppliers | AP Management |
| `/06-human-capital/workforce-admin/employees` | HR | Personnel & Documents |
| `/06-human-capital/payroll-benefits/process` | Payroll | Salary & Accruals |
| `/09-intelligence/business-intelligence/reports` | Reports | Financial Intelligence |
| `/navigation` | Command Matrix | Universal Navigation Shell |

### 5.6 Key Frontend Files

| File / Directory | Purpose |
| ---------------- | ------- |
| `lib/api.ts` | Fetch wrapper with authentication |
| `lib/auth.ts` | Authentication utilities |
| `lib/utils.ts` | General utilities |
| `lib/icons.tsx` | Icon components |
| `lib/translations.ts` | Arabic/English translations |
| `lib/invoice-utils.ts` | Invoice generation, printing, ZATCA compliance |
| `lib/endpoints/` | Domain-organized API endpoint definitions |
| `lib/endpoints.ts` | Endpoint barrel export |
| `lib/settings.ts` | Application settings utilities |
| `app/globals.css` | Global design system (~128KB - comprehensive CSS) |
| `app/layout.tsx` | Root layout |
| `stores/` | Zustand state stores (13 stores) |
| `components/` | Reusable UI components (6 categories) |

### 5.7 State Management

The frontend uses **Zustand** for global state management and React Hooks for component state:

**Zustand Stores** (in `stores/`):

| Store | Purpose |
| ----- | ------- |
| `useAuthStore` | Authentication state, session management |
| `useUIStore` | UI state, theme, sidebar, modals |
| `useFinanceStore` | Financial data, GL, fiscal periods |
| `usePayrollStore` | Payroll cycles, items, approvals |
| `useEmployeeStore` | Employee records, HR data |
| `useProductStore` | Product catalog, inventory state |
| `useCustomerStore` | Customer/AR data |
| `useSupplierStore` | Supplier/AP data |
| `usePurchaseStore` | Purchase transactions |
| `useSalesRepresentativeStore` | Sales rep management |
| `useServiceStore` | Service invoicing |
| `useSettingsStore` | System settings |
| `useErrorStore` | Global error handling |

**React Hooks:**
- `useState`: Component-level state
- `useEffect`: Side effects (API calls, subscriptions)
- `useRouter`: Next.js navigation

### 5.8 API Integration

All API calls go through `lib/api.ts`:

```typescript
import { fetchAPI } from '@/lib/api';

// Example: Get invoices
const response = await fetchAPI('invoices?page=1&per_page=20');

// Example: Create invoice
const response = await fetchAPI('invoices', {
  method: 'POST',
  body: JSON.stringify(invoiceData)
});
```

**Authentication Flow:**

4. On 401 response → Redirect to `/auth/login`

### 5.9 Advanced Components: Report Template Editor

For complex document generation, the system utilizes a dedicated Template Editor. This component enables:
- **Regex-based Syntax Highlighting** for HTML/CSS and system keys.
- **Isolated Iframe Preview** with real-time mock data injection.
- **Security Validation** to prevent malicious script injection.

Refer to the comprehensive sub-documentation:
- [Report Template Editor Index](./Developer/ReportTemplateEditor/index.md)
- [Technical Architecture](./Developer/ReportTemplateEditor/architecture.md)
- [AI & Automation Roadmap](./Developer/ReportTemplateEditor/ai-automation.md)

---

## 6. Database Schema & Models

The database schema has outgrown a single monolithic document. With over **81+ tables** distributed across 11 Bounded Contexts, the schema is now documented on a per-domain basis.

For complete data dictionaries, Entity-Relationship (Mermaid) diagrams, and table structures, please refer to the specific domain documentation:

- **[Enterprise Core Schema](./Domains/EnterpriseCore/database_Schema.md)** (Users, Roles, Modules, Settings)
- **[Commercial Schema](./Domains/Commercial/database_Schema.md)** (Customers, Invoices, Sales)
- **[Finance Schema](./Domains/Finance/database_Schema.md)** (Chart of Accounts, General Ledger, Taxes)
- **[Supply Chain Schema](./Domains/SupplyChain/database_Schema.md)** (Inventory, Products, Suppliers, Purchases)
- **[Human Capital Schema](./Domains/HumanCapital/database_Schema.md)** (Employees, Payroll Cycles, Deductions)
- **[Assets Schema](./Domains/Assets/database_Schema.md)** (Fixed Assets, Depreciation)

> **Auto-Generation:** Database schemas can be regenerated natively from the `backend/` by running `php artisan docs:generate-schema`.

---

## 7. API Surface & Contracts

The application exposes a robust REST API under `http://localhost:8000/api`. With **77 domain-organized controllers**, the API contract documentation has been moved to a dedicated hierarchical location.

Please refer to the **[API Documentation Hub](./API/)** for:

1. **[Authentication & Authorization](./API/Authentication_And_Authorization_Contracts.md)**
2. **[Rate Limiting & Security](./API/Rate_Limiting_And_Security.md)**
3. **[API Philosophy & Versioning](./API/API_Philosophy_And_Versioning.md)**

For domain-specific endpoint documentation (request bodies, response payloads), view the specific Bounded Context in `docs/Domains/`.

---

## 8. Business Logic & Services

In the Domain-Driven Design (DDD) architecture, core business logic is encapsulated within `Actions/` and `Services/` directories inside each bounded context (`app/Domains/{Context}/{Subdomain}/`).

Detailed algorithmic documentation for complex domain engines is available in the respective domain documentation:

- **General Ledger Engine (`LedgerService`)**: See [Finance Domain](./Domains/Finance/GeneralLedger/)
- **Tax Engine (`TaxCalculator`)**: See [Tax Compliance Domain](./Domains/Finance/TaxCompliance/)
- **Payroll Workflow (`PayrollService`)**: See [Human Capital Domain](./Domains/HumanCapital/PayrollBenefits/)
- **Inventory Costing (FIFO/Average)**: See [Supply Chain Domain](./Domains/SupplyChain/Inventory/)
- **Depreciation Calculation**: See [Assets Domain](./Domains/Assets/AssetLifecycle/)

---

## 9. Security & Authentication

### 9.1 Authentication Flow

```txt
1. User submits login (username + password)
   ↓
2. AuthService validates credentials
   ↓
3. AuthService creates session record with unique token
   ↓
4. Token returned to frontend, stored in localStorage
   ↓
5. All API requests include X-Session-Token header
   ↓
6. ApiAuth middleware validates token against sessions table
   ↓
7. If valid, sets Laravel's authenticated user
   ↓
8. Controller can access auth()->user()
```

### 9.2 Session Management

**Sessions Table Structure:**

- `token`: Unique 64-character string
- `user_id`: Foreign key to users
- `last_activity`: Updated on each request
- Automatic cleanup of inactive sessions possible

**Session Expiration:**

- Configured in `.env`: `SESSION_LIFETIME=120` (minutes)
- Middleware can implement auto-expiration logic

### 9.3 Password Hashing

- Uses Laravel's `Hash` facade (bcrypt)
- Configured rounds: `BCRYPT_ROUNDS=12`

### 9.4 Authorization

**Role-Based Permissions:**

1. Each user has a `role_id`
2. `role_permissions` defines what each role can do per module
3. `PermissionService::requirePermission()` enforces in controllers

**Example:**

```php
// In controller
PermissionService::requirePermission('sales', 'create');
// Throws 403 if current user's role lacks 'sales.create'
```

### 9.5 Input Validation

**Form Requests:**

- `StoreInvoiceRequest`, `StorePurchaseRequest`, etc.
- Laravel's built-in validation rules
- Automatic JSON error responses

**Example:**

```php
class StoreInvoiceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'payment_type' => 'required|in:cash,credit',
        ];
    }
}
```

### 9.6 SQL Injection Prevention

- **Eloquent ORM** used throughout
- No raw queries without parameter binding
- `DB::select()` calls use bindings

### 9.7 XSS Prevention

- Frontend: `escapeHtml()` utility in `lib/api.ts`
- React naturally escapes JSX content
- API responses are JSON (not HTML)

### 9.8 CORS Configuration

- Configured in Laravel for `localhost:3000`
- Production: Update `config/cors.php`

---

## 10. Developer Onboarding

### 10.1 Full Stack Local Setup

- **Step 1: Clone Repository**

```bash
git clone <repository-url>
cd accore
```

- **Step 2: Backend Setup**

```bash
cd backend

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate
# Optional: php artisan db:seed

# Verify installation
php artisan --version
```

- **Step 3: Frontend Setup**

```bash
  cd ../frontend

  # Install dependencies
  npm install

  # Environment setup (if needed)
  echo "NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api" > .env.local

  # Verify installation
  npm run build
```

- **Step 4: Run Both Apps**

  - **Terminal 1 (Backend):**

```bash
  cd backend
  php artisan serve
  # Backend running on http://localhost:8000
```

- **Terminal 2 (Queue Worker):**

```bash
    cd backend
    php artisan queue:listen
```

- **Terminal 3 (Frontend):**

```bash
    cd frontend
    npm run dev
    # Frontend running on http://localhost:3000
```

- **Step 5: Access Application**
  - Navigate to <http://localhost:3000>
  - Login with default credentials (if seeded)
    - Username: `admin`
    - Password: `admin` (change in production!)

### 10.2 Development Workflow

**Making Changes:**

1. **Backend Changes:**
   - Modify models, controllers, services in `/backend/app`
   - Create migrations: `php artisan make:migration`
   - Run migrations: `php artisan migrate`
   - Clear cache: `php artisan config:clear`

2. **Frontend Changes:**
   - Modify pages in `/frontend/app`
   - Add components in `/frontend/components`
   - Update types in `/frontend/lib/types.ts`
   - Next.js auto-reloads on save

3. **Database Changes:**
   - Always create migrations (never edit existing ones in production)
   - Test rollback: `php artisan migrate:rollback`
   - Fresh migration: `php artisan migrate:fresh` (dev only!)

**Git Workflow:**

```bash
  # Create feature branch
  git checkout -b feature/new-module

  # Make changes, commit frequently
  git add .
  git commit -m "Add new module"

  # Push and create PR
  git push origin feature/new-module
```

### 10.3 Code Style Guidelines

**PHP (Backend):**

- Follow PSR-12
- Use type hints
- Services for business logic, controllers stay thin
- Use Form Requests for validation

**TypeScript (Frontend):**

- Use interfaces for all data structures
- Prefer `const` over `let`
- Use async/await over .then()
- Component file = PascalCase, utils file = camelCase

### 10.4 Testing

**Backend Tests:**

```bash
cd backend
php artisan test
```

**Frontend:**

- No testing framework configured yet
- Recommend: Jest + React Testing Library

### 10.5 Internal Documentation Standards

To maintain code clarity and facilitate onboarding, the project follows strict internal documentation standards.

**Backend (PHPDoc):**

- All **Services** and **Controllers** must have class-level DocBlocks.
- All **public methods** must document:
  - Purpose and high-level logic.
  - `@param` with types and descriptions.
  - `@return` type and description.
  - `@throws` for any exceptions the method might raise.
- Complex business rules (e.g., inventory costing layers, ZATCA hash calculation) must include inline comments explaining the rationale.

**Frontend (TSDoc/JSDoc):**

- **Utility libraries** (e.g., `lib/api.ts`, `lib/auth.ts`) must have comprehensive DocBlocks for all exported functions.
- **Interfaces and Types** in `lib/types.ts` should include comments for each property.
- **Components** should document their props and any complex internal state management logic.
- Use `@param`, `@returns`, and `@interface` tags where appropriate.

---


## 11. Troubleshooting & Common Issues

### 11.1 Backend Issues

- **Issue: "No application encryption key has been specified"**

```bash
php artisan key:generate
```

- **Issue: Database connection error**
  - Check `.env` file DB settings
  - For MySQL: Verify credentials and database exists

- **Issue: 500 error on API calls**

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

- **Issue: Migrations fail**

```bash
  # Check migration status
  php artisan migrate:status

  # Rollback last batch
  php artisan migrate:rollback

  # Fresh install (DESTROYS DATA)
  php artisan migrate:fresh
```

- **Issue: "Class not found"**

```bash
  composer dump-autoload 
```

### 11.2 Frontend Issues

- **Issue: "Cannot connect to API"**
  - Verify backend is running on port 8000
  - Check `NEXT_PUBLIC_API_BASE` in `.env.local`
  - Check browser console for CORS errors

- **Issue: 401 Unauthorized on all API calls**
  - Check `localStorage.sessionToken` in browser DevTools
  - Token may have expired, try re-logging in
  - Verify backend session middleware is working

- **Issue: Module not found errors**

```bash
  # Clear Next.js cache
  rm -rf .next
  npm run dev
```

- **Issue: Build fails**

```bash
  # Clear node_modules
  rm -rf node_modules package-lock.json
  npm install
```

### 11.3 Common Development Pitfalls

- **Problem: Changes not reflecting**
  - **Backend:** Clear cache (`php artisan config:clear`)
  - **Frontend:** Hard refresh (Ctrl+Shift+R) or restart dev server

- **Problem: Stock going negative**
  - Check `InventoryCostingService` logic
  - Verify purchase approvals are posting to stock

- **Problem: GL entries not balancing**
  - Review `LedgerService::postTransaction()`
  - Ensure all service methods pass balanced entries

- **Problem: Payroll approval stuck**
  - Check `users.manager_id` hierarchy
  - Verify approval workflow in `PayrollService`

---

## 12. Deployment Guide

Deployment strategies, CI/CD pipelines, database backup policies, and production server configurations have been moved to the `Operations` documentation hub.

Please refer to:
- **[Deployment Strategy](./Operations/Deployment_Strategy.md)**
- **[Production Environment Governance](./Operations/Production_Environment_Governance.md)**
- **[Database Backup & Recovery Policies](./Operations/Database_Backup_And_Recovery_Policies.md)**

---

## Appendix A: Key Files Reference

### Backend Key Files

```txt
backend/
├── app/Domains/                              # DDD Bounded Contexts
│   ├── Commercial/SalesLifecycle/
│   │   ├── Actions/CreateInvoiceAction.php   # Invoice creation
│   │   └── Services/SalesService.php         # Sales business logic
│   ├── Finance/GeneralLedger/
│   │   └── Services/LedgerService.php        # Core GL engine
│   └── HumanCapital/PayrollBenefits/
│       └── Services/PayrollService.php       # Payroll workflow
├── app/Http/Controllers/Api/V2/              # Domain-organized controllers
│   ├── Commercial/SalesLifecycle/SalesController.php
│   ├── Finance/GeneralLedger/GeneralLedgerController.php
│   └── HumanCapital/PayrollBenefits/PayrollController.php
├── routes/api.php                            # API route definitions
└── database/migrations/                      # 81+ schema definitions
```

### Frontend Key Files

```txt
frontend/
├── app/
│   ├── 01-enterprise-core/system-overview/dashboard/page.tsx   # Global Dashboard
│   ├── 02-commercial/sales-lifecycle/direct-sales/page.tsx     # Enterprise POS
│   ├── 03-finance/general-ledger/view/page.tsx                # Financial Core
│   └── 06-human-capital/workforce-admin/employees/page.tsx    # HR & Payroll
├── lib/
│   ├── api.ts                                                 # Secure Fetch Wrapper
│   ├── auth.ts                                                # Session Guard Logic
│   └── endpoints/                                             # Domain API Endpoints
├── components/
│   ├── ui/                                                    # Base UI Components
│   ├── navigation/                                            # Shell Matrix Pillars
│   ├── template-editor/                                       # Document Architect
│   ├── number-range/                                          # Numbering Engine UI
│   ├── tax/                                                   # Tax Engine Components
│   └── layout/                                                # Layout Components
└── stores/                                                    # Zustand State Stores (13)
```

---

## Appendix B: Glossary

| Term | Definition |
| ------ | ------------ |
| **Bounded Context** | A logical boundary within the system where a specific domain model applies (e.g., Finance, Human Capital). |
| **Action Pattern** | Single-responsibility classes handling specific business operations (e.g., `CreateInvoiceAction`). |
| **Service Layer** | Orchestration layer within a Bounded Context handling complex business rules. |
| **DTO** | Data Transfer Object - used to pass typed data structures between controllers and actions. |
| **AR / AP** | Accounts Receivable (money owed by customers) / Accounts Payable (money owed to suppliers). |
| **GL** | General Ledger - the core double-entry accounting journal. |
| **COGS** | Cost of Goods Sold - direct costs attributable to the production of the goods sold. |
| **FIFO** | First In, First Out - the primary inventory costing method used. |
| **ZATCA** | Saudi e-invoicing authority (Zakat, Tax and Customs Authority). |
| **TLV** | Tag-Length-Value encoding used specifically for Phase 2 ZATCA QR codes. |
| **Voucher Number** | Unique string identifier generated by the `number-range` engine for transactions. |
| **Fiscal Period** | Accounting period (month/quarter/year) dictating GL posting boundaries. |
| **Chart of Accounts** | Hierarchical tree of GL accounts classifying all financial transactions. |
| **Accrual** | Recording financial transactions when they are incurred, not necessarily when cash changes hands. |

---

## Appendix C: Contact & Support

**Documentation Version:** 3.0  
**Last Reviewed:** March 28, 2026

For issues or questions:

1. Check logs: `backend/storage/logs/laravel.log`
2. Review this documentation
3. Submit issue with detailed error logs
