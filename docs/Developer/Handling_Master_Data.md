---
title: "Handling Master Data"
domain: "Developer"
subdomain: ""
tier: 5
status: draft
task_id: "DEV-005"
template: "developer-guide"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 548
---

# Handling Master Data

## What Is Master Data?

Master data in accore consists of the reference records that all transactional data depends on. Unlike transactional records (which are created continuously as business activity occurs), master data is set up once during system initialization and changes infrequently. Corrupting or duplicating master data breaks GL calculations, fiscal period controls, and permission resolution across the entire system.

## Core Master Data Types

| Master Data | Table | Purpose | Seeder |
|-------------|-------|---------|--------|
| Chart of Accounts | `chart_of_accounts` | GL account hierarchy; every journal entry references a COA record | `ChartOfAccountsSeeder` |
| Fiscal Periods | `fiscal_periods` | Accounting periods; GL entries are period-bound | (manual or migration) |
| Currencies | `currencies` | Currency codes and exchange rates; the base currency has `is_primary = true` | `CurrencySeeder` |
| Currency Policies | `currency_policies` | Exchange rate rules between currency pairs | `CurrencyPolicySeeder` |
| Roles and Permissions | `roles`, `permissions` | RBAC definitions; every protected route requires a role-permission mapping | `RoleSeeder`, `PermissionSeeder` |
| Modules | `modules` | System module registry; used by the permission system to validate module names | `ModuleSeeder` |
| Settings | `settings` | Organization-level configuration including country, VAT settings, and document sequence rules | `SettingsSeeder` |
| Document Templates | `document_templates` | Approved templates for HR document generation | `DocumentTemplateSeeder` |

## Running Master Data Seeders

```bash
cd backend

# Seed all master data in correct dependency order
php artisan db:seed --class=ChartOfAccountsSeeder
php artisan db:seed --class=CurrencySeeder
php artisan db:seed --class=CurrencyPolicySeeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=ModuleSeeder
php artisan db:seed --class=SettingsSeeder
php artisan db:seed --class=DocumentTemplateSeeder
```

**Order matters.** Roles must exist before permissions are assigned. Currencies must exist before currency policies. Chart of Accounts must exist before fiscal periods are linked.

## Updating Master Data Safely

Master data is updated through database migrations rather than by editing seeder files when the change is structural. Use additive migrations for new COA entries, new currency records, or new permission definitions. Never write a migration that truncates or drops a master data table on a system with transactional history.

For non-structural changes (such as updating an organization setting), use the Settings API endpoint rather than a migration.

## Chart of Accounts Conventions

The COA uses an `account_type` field with the following values that the Intelligence domain's report generators depend on directly:

| account_type | Meaning |
|-------------|---------|
| `Asset` | Balance sheet asset account |
| `Liability` | Balance sheet liability account |
| `Equity` | Balance sheet equity account |
| `Revenue` | Profit and loss revenue account |
| `Expense` | Profit and loss expense account |

**Do not introduce new account_type values without updating the Intelligence domain's report generators.** The Balance Sheet and P&L reports use these exact strings in WHERE clauses.

## Idempotent Seeders

All seeders must be idempotent — running the same seeder twice must not duplicate records. Use `updateOrCreate()` or `firstOrCreate()` rather than `create()` in seeders:

```php
ChartOfAccount::updateOrCreate(
    ['account_code' => '1000'],
    ['account_name' => 'Cash', 'account_type' => 'Asset']
);
```

## Testing with Master Data

Feature tests that test financial functionality must set up the required master data in `setUp()`. The `TaxEngineIntegrationTest` is the canonical example: it calls `seedChartOfAccounts()` in setUp and uses `Config::set()` to configure tax settings before each test.
