# Contributing to ACCSYSTEM ERP System

Thank you for considering contributing to our Enterprise Resource Planning (ERP) system!

> **📋 Full Contributing Guide:** For the comprehensive, detailed contributing standards — including coding standards, PR process, testing requirements, security considerations, and performance guidelines — please see [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md).

This document provides a quick-start summary. The `.github/CONTRIBUTING.md` is the authoritative reference.

---

## Quick Start

### Prerequisites

- **PHP 8.2+** with extensions: `pdo_mysql`, `mbstring`, `xml`, `bcmath`, `json`, `curl`, `zip`, `intl`
- **Node.js 20+** and npm 10+
- **MySQL 8.0+**
- **Composer** (latest)
- **Git 2.40+**

### Setup

```bash
# Fork & clone
git clone https://github.com/<YOUR_USERNAME>/ACCSYSTEM.git
cd ACCSYSTEM

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Frontend
cd ../frontend
npm install

# Run (two terminals)
cd backend && php artisan serve    # Port 8000
cd frontend && npm run dev         # Port 3000
```

Login at `http://localhost:3000` with `admin / admin`.

---

## Types of Contributions

| Type | Description |
| ---- | ----------- |
| 🐛 **Bug Fixes** | Report via [Issue Templates](./.github/ISSUE_TEMPLATE/) and submit fixes with tests |
| ✨ **New Features** | Discuss in an issue first, then follow the feature development process |
| 📚 **Documentation** | Improve docs in `/docs/` hierarchy or code comments |
| 🔨 **Refactoring** | Improve code quality and maintainability |
| ✅ **Testing** | Add test coverage using PHPUnit/Pest (backend) or Vitest (frontend) |

---

## Contribution Areas by Domain

The system is organized into **11 bounded contexts** following Domain-Driven Design. See [docs/Domains/](./docs/Domains/) for full domain documentation.

| Domain | Backend Path | Skills Needed | Difficulty |
| ------ | ------------ | ------------- | ---------- |
| **EnterpriseCore** | `Domains/EnterpriseCore/` | Auth, RBAC, Laravel | Intermediate |
| **Commercial** | `Domains/Commercial/` | Sales, CRM, Invoicing | Intermediate |
| **Finance** | `Domains/Finance/` | Double-Entry Accounting, Tax | Advanced |
| **SupplyChain** | `Domains/SupplyChain/` | Inventory Costing, Procurement | Intermediate-Advanced |
| **HumanCapital** | `Domains/HumanCapital/` | Payroll, HR Workflows | Intermediate-Advanced |
| **Manufacturing** | `Domains/Manufacturing/` | Production, QC | Intermediate |
| **Projects** | `Domains/Projects/` | Project Management | Intermediate |
| **Assets** | `Domains/Assets/` | Depreciation, Asset Tracking | Intermediate |
| **Intelligence** | `Domains/Intelligence/` | Reporting, Analytics, SQL | Advanced |
| **Platform** | `Domains/Platform/` | Integrations, Customization | Intermediate |
| **UI/UX** | `frontend/` | React, TypeScript, Tailwind | Beginner-Intermediate |

---

## Branch Strategy

We use a trunk-based workflow with short-lived feature branches:

| Prefix | Use Case | Example |
| ------ | -------- | ------- |
| `feat/` | New functionality | `feat/payroll-overtime-calculation` |
| `fix/` | Bug correction | `fix/ledger-rounding-error` |
| `refactor/` | Internal restructuring | `refactor/purchase-service-decomposition` |
| `docs/` | Documentation only | `docs/api-reference-update` |
| `chore/` | Build, CI, dependencies | `chore/upgrade-laravel-12.4` |
| `test/` | Test additions | `test/ar-aging-report-edge-cases` |

**Full branching policy and commit message convention:** See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md#4-branching-strategy) and [`.github/COMMIT_GUIDELINES.md`](./.github/COMMIT_GUIDELINES.md).

---

## Pull Request Process

1. Rebase onto latest `develop`
2. Run backend tests: `cd backend && php artisan test`
3. Run frontend tests: `cd frontend && npm run test`
4. Format code:
   - Backend: `./vendor/bin/pint`
   - Frontend: `npm run format && npm run lint`
5. Push and open PR using the [PR template](./.github/PULL_REQUEST_TEMPLATE.md)

**Full PR checklist and review criteria:** See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md#6-pull-request-process).

---

## Documentation Updates

When adding features, update the relevant documentation:

| What Changed | Where to Update |
| ------------ | --------------- |
| New API endpoint | `docs/API/` |
| Database schema change | `docs/Domains/<Domain>/database_Schema.md` (auto-generated) |
| Business logic / workflow | `docs/Domains/<Domain>/` |
| Architecture pattern | `docs/Architecture/` |
| User-facing feature | `docs/USER_GUIDE.md` (Arabic & English) |
| Deployment / ops change | `docs/Operations/` |
| High-level project info | `README.md` |
| Code comments | PHPDoc (backend) / TSDoc (frontend) |

**Full documentation standards:** See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md#11-documentation-expectations).

---

## Key Resources

| Resource | Location |
| -------- | -------- |
| **Full Contributing Guide** | [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) |
| **Commit Guidelines** | [`.github/COMMIT_GUIDELINES.md`](./.github/COMMIT_GUIDELINES.md) |
| **Code of Conduct** | [`.github/CODE_OF_CONDUCT.md`](./.github/CODE_OF_CONDUCT.md) |
| **Security Policy** | [`.github/SECURITY.md`](./.github/SECURITY.md) |
| **PR Template** | [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) |
| **Issue Templates** | [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/) |
| **CI Workflows** | [`.github/workflows/`](./.github/workflows/) |
| **Technical Documentation** | [`docs/TECHNICAL_DOCUMENTATION.md`](./docs/TECHNICAL_DOCUMENTATION.md) |
| **Developer Guides** | [`docs/Developer/`](./docs/Developer/) |
| **Domain Documentation** | [`docs/Domains/`](./docs/Domains/) |
| **Documentation Index** | [`docs/DOCUMENTATION_INDEX.md`](./docs/DOCUMENTATION_INDEX.md) |

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## Questions?

1. Check the [Documentation Index](./docs/DOCUMENTATION_INDEX.md)
2. Search [closed pull requests](https://github.com/ACCSYSTEM/ACCSYSTEM-erp/pulls?q=is%3Apr+is%3Aclosed)
3. Ask in [GitHub Discussions](https://github.com/ACCSYSTEM/ACCSYSTEM-erp/discussions)
4. For security issues, follow the process in [`.github/SECURITY.md`](./.github/SECURITY.md)

---

**Every contribution, no matter how small, makes a difference. Thank you! 🎉**
