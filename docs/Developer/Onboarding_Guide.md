---
title: "Onboarding Guide"
domain: "Developer"
subdomain: ""
tier: 5
status: draft
task_id: "DEV-001"
template: "developer-guide"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 617
---

# Onboarding Guide

## What Is accore?

accore is a full-stack Enterprise Resource Planning (ERP) application serving the Arabic-speaking Middle East market, built for Saudi and Yemeni business compliance requirements. The system manages Finance, Assets, Commercial (Sales/AR), Supply Chain, Human Capital, Manufacturing, Projects, and Intelligence domains. It is built as a domain-driven Laravel 12 backend serving a Next.js frontend.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Laravel (PHP) | 12.x |
| Frontend | Next.js (React) | Latest |
| Database | SQLite (development), compatible with MySQL/PostgreSQL | — |
| API Protocol | RESTful JSON over HTTP | — |
| PHP Runtime | PHP | ≥ 8.2 |

## Project Layout

```
workspace/
├── backend/          # Laravel API backend (serves :8000)
│   ├── app/
│   │   ├── Domains/  # All business logic; one folder per domain
│   │   └── Http/     # Controllers and Middleware
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/
│   ├── routes/
│   │   └── domains/  # One route file per domain
│   └── tests/
├── frontend/         # Next.js frontend (serves :5000)
│   └── src/
├── docs/             # This documentation site
└── start.sh          # Starts both services
```

## Getting Started

### 1. Start the Application

```bash
bash start.sh
```

This launches both the backend API (`:8000`) and the frontend (`:5000`) in sequence.

### 2. Verify the Backend

```bash
curl http://localhost:8000/api/v2/check
```

Expect a `401 Unauthorized` response (correct — no session yet).

### 3. Authenticate

```bash
curl -X POST http://localhost:8000/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

Use the returned `session_token` value as `X-Session-Token` on all subsequent requests.

### 4. Explore the Frontend

Open the frontend at `http://localhost:5000`. The frontend communicates with the backend via the `NEXT_PUBLIC_API_BASE` environment variable.

## Domain Directory Convention

Each domain under `backend/app/Domains/` follows this structure:

```
DomainName/
└── SubdomainName/
    ├── Actions/      # Single Action Classes (one class per business operation)
    ├── Models/       # Eloquent models
    ├── Services/     # Complex domain services
    └── DTOs/         # Data Transfer Objects
```

Routes for each domain live in `backend/routes/domains/NN-domain-name.php`.

## Adding a New Feature (Summary)

1. Add the Eloquent model under `Domains/{Domain}/{Subdomain}/Models/`.
2. Create the migration under `database/migrations/`.
3. Create an Action class under `Domains/{Domain}/{Subdomain}/Actions/`.
4. Register the route in the appropriate `routes/domains/` file with the correct `can:` middleware.
5. Add a factory under `database/factories/` for the new model.
6. Write a Feature test under `tests/Feature/`.

See [Creating a New Module](Creating_A_New_Module.md) for the full walkthrough.

## Key Conventions

- **No raw arrays between layers.** Use DTOs (`DataTransferObject::fromRequest()` or `fromArray()`).
- **All responses use the Shared envelope.** Extend `Action` and use `successResponse()`, `errorResponse()`, or `paginatedResponse()`.
- **Every write operation calls `TelescopeService::logOperation()`.** This is mandatory for audit trail compliance.
- **Permissions are required for all protected routes.** Use `can:module,action` middleware on routes and `PermissionService::requirePermission()` inside Actions.

## Running Tests

```bash
cd backend && php artisan test
```

PHPUnit 11 is the test runner. Factories are available for all major models. Integration tests use `RefreshDatabase` to reset state between test cases.

## Environment Variables

Key variables are set in `backend/.env`:

| Variable | Purpose |
|----------|---------|
| `APP_ENV` | Runtime environment (`local`, `production`) |
| `DB_CONNECTION` | Database driver (default: `sqlite`) |
| `APP_KEY` | Laravel encryption key |
| `NEXT_PUBLIC_API_BASE` | Frontend API base URL |
