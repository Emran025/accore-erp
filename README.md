# ACCSYSTEM ERP System - Enterprise Resource Planning

> **Enterprise-Grade ERP Solution** | Laravel 12 + Next.js 16 | Full-Stack TypeScript/PHP

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4.svg)](https://php.net)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## About ACCSYSTEM ERP

**ACCSYSTEM ERP** is a comprehensive, enterprise-grade **Enterprise Resource Planning (ERP)** system designed for small to medium-sized businesses. Built with modern technologies, it integrates all core business functions into a unified platform.

### Why Choose ACCSYSTEM ERP?

| Feature | Benefit |
| ------- | ------- |
| **Unified Platform** | Seamlessly integrates Sales, Purchases, Inventory, Finance, HR, and Payroll |
| **Real-Time Data** | Instant updates across all modules with automatic ledger postings |
| **ZATCA Compliant** | Full Saudi Arabia e-invoicing compliance with QR code generation |
| **Multi-Language** | Arabic (RTL) and English interface support |
| **Role-Based Access** | Granular permissions with multi-level approval workflows |
| **Audit Trail** | Complete transaction history and change tracking |
| **Modern Stack** | Laravel 12 backend with Next.js 16 frontend |

---

## 🚀 Quick Start

### Prerequisites

- **PHP 8.2+** with extensions: `mysql`, `mbstring`, `xml`, `bcmath`, `json`, `curl`
- **Composer** (latest)
- **Node.js 20+** and npm
- **Git**

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone <your-repo-url> ACCSYSTEM-erp
cd ACCSYSTEM-erp

# 2. Backend Setup
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed

# or reset and reseed
php artisan migrate:fresh --seed

# 3. Frontend Setup
cd ../frontend
npm install

# 4. Run the application
# Terminal 1 - Backend
cd backend && php artisan serve

# Terminal 2 - Frontend
cd frontend && npm run dev

# 5. Access the ERP
# Open http://localhost:3000
# Default login: username: admin / password: admin123
```

---

## 📚 Documentation

The project documentation lives in `/docs/` and is organized into a **domain-driven hierarchy**:

| Category | Path | Description |
| -------- | ---- | ----------- |
| **[Architecture](./docs/Architecture/)** | `docs/Architecture/` | DDD patterns, frontend/backend separation, event bus, UX system |
| **[API](./docs/API/)** | `docs/API/` | API philosophy, versioning, auth contracts, rate limiting |
| **[Domains](./docs/Domains/)** | `docs/Domains/` | Per-domain business logic, schemas & workflows (11 bounded contexts) |
| **[Developer](./docs/Developer/)** | `docs/Developer/` | Onboarding, testing, creating modules, report template editor |
| **[Operations](./docs/Operations/)** | `docs/Operations/` | Deployment, backups, audit trails, production governance |
| **[System](./docs/System/)** | `docs/System/` | ERP philosophy, bounded context map, financial immutability |
| **[User Guide](./docs/USER_GUIDE.md)** | `docs/USER_GUIDE.md` | 📖 Bilingual user manual (Arabic/English) for non-technical users |
| **[Documentation Index](./docs/DOCUMENTATION_INDEX.md)** | `docs/DOCUMENTATION_INDEX.md` | 🗺️ Full documentation navigation guide |

---

## 📦 ERP Modules

The system is organized into **10 enterprise domains** following Domain-Driven Design. Each domain has dedicated documentation in [`docs/Domains/`](./docs/Domains/).

| # | Domain | Key Capabilities | Docs |
| - | ------ | ---------------- | ---- |
| 1 | **Enterprise Core** | Identity & Access (RBAC), Organization Governance, Automation, Number Ranges | [Docs](./docs/Domains/EnterpriseCore/) |
| 2 | **Commercial** | Sales & POS, CRM, Revenue & Receivables, Marketing | [Docs](./docs/Domains/Commercial/) |
| 3 | **Finance** | General Ledger, Tax Engine (ZATCA), Treasury, Multi-Currency, Audit | [Docs](./docs/Domains/Finance/) |
| 4 | **Supply Chain** | Inventory (FIFO/Average), Procurement, Accounts Payable | [Docs](./docs/Domains/SupplyChain/) |
| 5 | **Manufacturing** | Production Control, Engineering, Quality Control | [Docs](./docs/Domains/Manufacturing/) |
| 6 | **Human Capital** | 20+ modules: Employees, Payroll, Recruitment, Performance, Benefits, EHS, Wellness | [Docs](./docs/Domains/HumanCapital/) |
| 7 | **Projects** | Planning, Execution Tracking, Project Finance | [Docs](./docs/Domains/Projects/) |
| 8 | **Assets** | Fixed Asset Lifecycle, Depreciation (SL/DB), Investments | [Docs](./docs/Domains/Assets/) |
| 9 | **Intelligence** | Financial Reports (BS, P&L, CF), Business Intelligence, Analytics | [Docs](./docs/Domains/Intelligence/) |
| 10 | **Platform** | Integration Hub, Customization, Communication | [Docs](./docs/Domains/Platform/) |

### Cross-Cutting Features

| Feature | Description |
| ------- | ----------- |
| **Dashboard** | Real-time KPIs, sales trends, inventory alerts |
| **Role Management** | Customizable roles with granular permissions |
| **Audit Trail** | Complete transaction logging |
| **Number Ranges** | SAP-style numbering engine for enterprise-wide unique identification |
| **Batch Processing** | Background job processing |
| **Accrual Accounting** | Prepayments, unearned revenue, payroll accruals |
| **Fiscal Periods** | Opening/closing periods, period locking |

---

## 🏗️ Architecture

```txt
┌─────────────────────────────────────┐
│   NEXT.JS FRONTEND (Port 3000)      │
│   React 19 + TypeScript + Tailwind  │
└─────────────────┬───────────────────┘
                  │ REST API (JSON)
┌─────────────────▼───────────────────┐
│    LARAVEL BACKEND (Port 8000)      │
│    PHP 8.2 + DDD + Actions Layer    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│    DATABASE (MySQL)                  │
│    81+ Migrations, Full ACID         │
└─────────────────────────────────────┘
```

**Design Patterns:**

- **Backend:** Domain-Driven Design, Actions Pattern, Service Layer, Contracts, Policies, Form Requests, Middleware
- **Frontend:** Component-based, Zustand State Management, Custom Hooks, Utility-first CSS

---

## Project Structure

```txt
ACCSYSTEM-erp/
│
├── backend/                            # Laravel 12 Enterprise API
│   ├── app/
│   │   ├── Domains/                    # 11 Bounded Contexts (DDD)
│   │   │   ├── Assets/                 # Asset Lifecycle & Investments
│   │   │   ├── Commercial/             # CRM, Sales, Revenue & Receivables
│   │   │   ├── EnterpriseCore/         # Identity, Automation, Governance
│   │   │   ├── Finance/               # GL, Tax, Treasury, FX
│   │   │   ├── HumanCapital/          # Workforce, Payroll, Talent, Wellness
│   │   │   ├── Intelligence/          # BI & Advanced Analytics
│   │   │   ├── Manufacturing/         # Production, Engineering, QC
│   │   │   ├── Platform/             # Integration Hub, Customization
│   │   │   ├── Projects/             # Planning, Execution, Finance
│   │   │   ├── Shared/               # Cross-domain utilities
│   │   │   └── SupplyChain/          # Inventory, Procurement, AP
│   │   ├── Contracts/                  # Domain Interfaces
│   │   ├── Enums/                      # System Enumerations
│   │   ├── Http/Controllers/Api/V2/   # 77 Domain-Organized Controllers
│   │   ├── Policies/                   # Authorization Policies
│   │   ├── Jobs/                       # Background Jobs
│   │   └── Helpers/                    # Core System Helpers
│   ├── database/migrations/            # 81+ Schema Definitions
│   ├── routes/api.php                  # Primary API Registry
│   └── config/                         # Application Configuration
│
├── frontend/                           # Next.js 16 Precision Frontend
│   ├── app/                            # Domain-Driven Modular Routing
│   │   ├── 01-enterprise-core/         # Identity & Governance
│   │   ├── 02-commercial/              # Sales & Revenue
│   │   ├── 03-finance/                 # Ledger & Treasury
│   │   ├── 04-supply-chain/            # Inventory & AP
│   │   ├── 05-manufacturing/           # Production Control
│   │   ├── 06-human-capital/           # Payroll & Workforce
│   │   ├── 07-projects/                # Project Execution
│   │   ├── 08-assets/                  # Asset Lifecycle
│   │   ├── 09-intelligence/            # Analytics & BI
│   │   ├── 10-platform/                # Extension Hub
│   │   ├── auth/                       # Authentication Guard
│   │   └── navigation/                 # Shell Matrix
│   ├── components/                     # Component Library
│   │   ├── ui/                         # Base UI Components
│   │   ├── navigation/                 # Shell Pillar Components
│   │   ├── template-editor/            # Report Template Architect
│   │   ├── number-range/               # Numbering Engine UI
│   │   ├── tax/                        # Tax Engine Components
│   │   └── layout/                     # Layout Components
│   ├── stores/                         # Zustand State Stores (13)
│   ├── lib/                            # Utils, API, Auth, Endpoints
│   └── public/                         # Static Assets & Media
│
├── docs/                               # Domain-Driven Documentation
│   ├── API/                            # API Contracts & Philosophy
│   ├── Architecture/                   # System Architecture & UX
│   ├── Developer/                      # Onboarding & Guides
│   ├── Domains/                        # 11 Bounded Context Docs
│   ├── Operations/                     # Deployment & Governance
│   └── System/                         # ERP Philosophy & Patterns
│
├── .engines/                           # Documentation Engines
│   ├── documentation-engine/           # Doc generation framework
│   └── api-doc-engine/                 # API documentation tooling
│
└── reports/                            # Report Templates & Policies
```

---

## Development

### Running Locally

**Full Stack (Recommended):**

```bash
# Terminal 1 - Backend
cd backend
php artisan serve

# Terminal 2 - Queue Worker (for background jobs)
cd backend
php artisan queue:listen

# Terminal 3 - Frontend
cd frontend
npm run dev
```

**With Composer Script (Backend only):**

```bash
cd backend
composer dev
# Runs: API, Queue, Logs concurrently
```

### Making Changes

**Backend (Laravel DDD):**

```bash
# Create migration
php artisan make:migration create_table_name

# Run migrations
php artisan migrate

# Clear cache
php artisan config:clear
```

**Frontend (Next.js):**

- Edit files in `frontend/app/`
- Auto-reloads on save
- Add types to relevant domain files
- Build: `npm run build`

---

## Testing

**Backend:**

```bash
cd backend
php artisan test
```

**Frontend:**

- Testing framework: Jest + React Testing Library (configurable)

---

## Security

- **Authentication:** Session-based with secure tokens
- **Authorization:** Role-based permissions (RBAC) with Policies
- **Validation:** Laravel Form Requests
- **SQL Injection:** Protected via Eloquent ORM
- **XSS:** React auto-escaping + custom utilities
- **Password Hashing:** Bcrypt (12 rounds)

---

## Deployment

### Production Checklist

**Backend:**

```bash
# Set environment
APP_ENV=production
APP_DEBUG=false

# Use production database (MySQL/PostgreSQL)
DB_CONNECTION=mysql

# Optimize
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# for clear database and migration it again and seed
php artisan migrate:refresh --seed

# Set up queue worker with Supervisor
```

**Frontend:**

```bash
# Build
npm run build

# Run production server
npm start

# Or deploy to Vercel/Netlify
```

See [Operations/Deployment_Strategy.md](./docs/Operations/Deployment_Strategy.md) for detailed deployment instructions.

---

## API Overview

**Base URL:** `http://localhost:8000/api`  
**Auth Header:** `X-Session-Token: {your_token}` (obtained via `POST /api/login`)

The API exposes **77 controllers** across all 10 enterprise domains, covering sales, purchases, inventory, GL, payroll, HR, assets, analytics, and more.

For complete API contracts, versioning philosophy, auth flows, and rate limiting, see the [API Documentation](./docs/API/).

---

## Tech Stack

### Backend (`/backend`)

| Component | Technology |
| --------- | ---------- |
| **Framework** | Laravel 12 |
| **Language** | PHP 8.2+ |
| **Architecture** | Domain-Driven Design (11 Bounded Contexts) |
| **Database** | MySQL |
| **ORM** | Eloquent |
| **Queue** | Database driver |
| **Cache** | Database driver |

### Frontend (`/frontend`)

| Component | Technology |
| --------- | ---------- |
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **State Management** | Zustand |
| **HTTP Client** | Fetch API |

---

## Troubleshooting

**Common Issues:**

| Problem | Solution |
| --------- | ---------- |
| "No encryption key" | `php artisan key:generate` |
| Database error | Check `.env` DB settings, ensure DB exists |
| 500 API error | Check `storage/logs/laravel.log` |
| Frontend can't connect | Verify backend running on port 8000 |
| 401 Unauthorized | Clear localStorage, re-login |
| Changes not reflecting | Clear cache: `php artisan config:clear` |

See [Operations/Deployment_Strategy.md](./docs/Operations/Deployment_Strategy.md) for detailed troubleshooting.

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for a quick-start summary, or [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) for the comprehensive guide covering coding standards, PR process, testing, and security.

---

## Support

- **Documentation:** See [docs/DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)
- **Developer Guides:** See [docs/Developer/](./docs/Developer/)
- **Issues:** Submit via [GitHub Issues](./.github/ISSUE_TEMPLATE/) with detailed logs
- **Security:** Follow the process in [`.github/SECURITY.md`](./.github/SECURITY.md)
- **Logs:** Check `backend/storage/logs/laravel.log`

---

> Built with: using Laravel & Next.js  
> **Developed, Planning, design, and direction \ Software Engineer Emran Nasser. Implementation \ AI Agent.**
