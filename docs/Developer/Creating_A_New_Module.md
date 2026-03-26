---
title: "Creating a New Module"
domain: "Developer"
subdomain: ""
tier: 5
status: draft
task_id: "DEV-002"
template: "developer-guide"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 612
---

# Creating a New Module

## Overview

In ACCSYSTEM, a "module" is a subdomain within a domain, implemented as a directory under `backend/app/Domains/{Domain}/{Subdomain}/`. This guide walks through the full end-to-end process of adding a new subdomain and wiring it into the application.

## Step 1: Create the Directory Structure

```
backend/app/Domains/{Domain}/{Subdomain}/
├── Actions/
├── Models/
├── Services/     (optional, for complex business logic)
└── DTOs/         (optional, for typed input objects)
```

**Example:** Adding a `Leasing` subdomain to the `Assets` domain:

```
backend/app/Domains/Assets/Leasing/
├── Actions/
└── Models/
```

## Step 2: Create the Eloquent Model

Create `Models/{ModelName}.php` extending `Illuminate\Database\Eloquent\Model`. Follow these conventions:

1. Declare `protected $fillable` with all user-assignable columns.
2. Declare `protected $casts` for date, boolean, and decimal fields.
3. Add relationship methods that reference models in **other** domains using fully-qualified class names.
4. Apply `SoftDeletes` unless the entity requires hard deletion (most entities should use soft deletion).
5. Set `protected $table` explicitly when the table name does not follow the Eloquent default plural convention.

## Step 3: Create the Database Migration

```bash
cd backend && php artisan make:migration create_{table_name}_table
```

Migration filename convention: `YYYY_MM_DD_HHMMSS_create_{table_name}_table.php`.

The migration `up()` method creates the table. Always include:
- `$table->id();` — auto-incrementing primary key
- `$table->timestamps();` — `created_at` / `updated_at`
- `$table->softDeletes();` — `deleted_at` (if using SoftDeletes)
- A `created_by` foreign key referencing the `users` table

Monetary columns use `decimal(15, 2)`. Date-only columns use `$table->date()`. Boolean flags use `$table->boolean()->default(false)`.

## Step 4: Create Action Classes

Each business operation (create, update, delete, list, show) becomes an individual Action class:

```php
namespace App\Domains\{Domain}\{Subdomain}\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

class Create{ModelName}Action
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('{module}', 'create');
        $record = {ModelName}::create([...$data, 'created_by' => auth()->id()]);
        TelescopeService::logOperation('CREATE', '{table}', $record->id, null, $data);
        return ['id' => $record->id];
    }
}
```

**Rules:**
- Always call `PermissionService::requirePermission()` at the start of any write action.
- Always call `TelescopeService::logOperation()` for CREATE, UPDATE, and DELETE operations.
- Pass `created_by` from `auth()->id()` on all create actions.
- Return an array; the controller wraps it in the standard response envelope.

## Step 5: Register Routes

Add the route to the appropriate domain file in `backend/routes/domains/`:

```php
Route::group(['prefix' => '{resource}', 'middleware' => 'can:{module},view'], function () {
    Route::get('/', [YourController::class, 'index'])->name('v2.{module}.index');
    Route::middleware(['can:{module},create', 'throttle:api-write'])
        ->post('/', [YourController::class, 'store'])->name('v2.{module}.store');
});
```

Apply `throttle:api-write` to all POST/PUT routes and `throttle:api-delete` to all DELETE routes.

## Step 6: Create a Factory

Add `database/factories/{ModelName}Factory.php` extending `Illuminate\Database\Eloquent\Factories\Factory`. Define `definition()` returning a full set of realistic fake values using Faker. Ensure factories are linked to the model via `protected $model`.

## Step 7: Write Tests

Add a Feature test in `backend/tests/Feature/` using `RefreshDatabase`. Test the happy path (valid data creates the record, correct response shape) and at least one failure path (invalid input returns `400`, unauthorized call returns `401` or `403`).

## Checklist

- [ ] Directory structure created
- [ ] Model with fillable, casts, and relationships
- [ ] Migration file created and run
- [ ] Action classes with permission and audit logging
- [ ] Route registered with correct `can:` middleware
- [ ] Factory defined
- [ ] Feature test written
