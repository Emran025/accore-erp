---
title: "Writing Financial Migrations"
domain: "Developer"
subdomain: ""
tier: 5
status: draft
task_id: "DEV-003"
template: "developer-guide"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 574
---

# Writing Financial Migrations

## Why Financial Migrations Are Different

Financial migrations differ from standard migrations because they touch tables that are directly linked to the General Ledger, fiscal period controls, and audit trails. A poorly written financial migration can corrupt balance calculations, break period-close processes, or violate GL integrity constraints. This guide defines the standards that must be followed when writing any migration that touches a financial domain table.

## Precision Standards

All monetary amounts must be stored as `decimal(15, 2)` — 15 total digits with 2 decimal places. Never use `float` or `double` for monetary amounts; floating-point types introduce rounding errors that accumulate across large transaction sets.

```php
// Correct
$table->decimal('amount', 15, 2);
$table->decimal('exchange_rate', 12, 4); // Rates need more decimal places

// Wrong — never use this for money
$table->float('amount');
```

## Standard Financial Table Columns

Any table that represents a financial transaction or balance should include the following columns:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `bigIncrements` | Primary key |
| `fiscal_period_id` | `foreignId` nullable | Links the record to a FiscalPeriod |
| `voucher_date` | `date` | The accounting date of the transaction |
| `amount` | `decimal(15,2)` | The transaction amount |
| `entry_type` | `string` | `DEBIT` or `CREDIT` |
| `created_by` | `foreignId` | The user who created the record |
| `timestamps()` | Eloquent | `created_at` / `updated_at` |
| `softDeletes()` | Eloquent | `deleted_at` — financial records are never hard-deleted |

## Fiscal Period Constraints

Financial records should reference a `fiscal_period_id` from the `fiscal_periods` table. When writing the foreign key, use nullable to accommodate records that pre-date period setup:

```php
$table->foreignId('fiscal_period_id')->nullable()->constrained('fiscal_periods');
```

**Important:** Never delete a fiscal period migration or a fiscal period foreign key. The GL integrity constraints rely on fiscal period linkage for period-close validation.

## General Ledger Reference Pattern

Any table that posts to the General Ledger should store a `reference_type` and `reference_id` pair as the backlink to the source document:

```php
$table->string('reference_type')->nullable(); // e.g., 'invoices', 'asset_depreciation'
$table->unsignedBigInteger('reference_id')->nullable(); // The ID in the source table
```

Do not use a polymorphic `morphs()` column for GL references; use the explicit string/integer pair to maintain compatibility with the existing GL query patterns.

## Running and Rolling Back

```bash
cd backend

# Apply migrations
php artisan migrate

# Rollback the last batch
php artisan migrate:rollback

# Rollback a specific number of steps
php artisan migrate:rollback --step=3
```

**Never use `migrate:fresh` or `migrate:reset` on a database containing real financial data.** These commands drop all tables and re-create them from scratch, destroying all transaction history.

## Seeding Financial Master Data

After a financial migration, you may need to seed Chart of Accounts entries or fiscal periods. Use the targeted seeders:

```bash
php artisan db:seed --class=ChartOfAccountsSeeder
php artisan db:seed --class=CurrencySeeder
```

Do not run `DatabaseSeeder` on a live system as it executes all seeders and may duplicate master data.

## Assumptions & Open Questions

<!-- [ASSUMPTION] -->
The fiscal period locking mechanism (preventing GL posts into a closed period) is inferred from the FiscalPeriod model's relationship to GeneralLedger entries. The explicit period-open validation inside the LedgerService was not fully inspected. Developers should verify that the period is open before writing migration logic that posts to the GL for a specific period.
