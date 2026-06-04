---
title: "Testing Strategy and Factories"
domain: "Developer"
subdomain: ""
tier: 5
status: draft
task_id: "DEV-004"
template: "developer-guide"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 558
---

# Testing Strategy and Factories

## Testing Philosophy

accore uses PHPUnit 11 as its test runner within the Laravel testing framework. The strategy is pragmatic: Feature tests verify the full request-response cycle including authentication, authorization, database writes, and response shape. Unit tests cover isolated service and calculation logic. The test suite prioritizes correctness of business rules over exhaustive code coverage metrics.

## Test Layers

| Layer | Location | Scope |
|-------|----------|-------|
| Feature | `backend/tests/Feature/` | Full HTTP request cycle, DB interaction, business rules |
| Unit | `backend/tests/Unit/` | Pure logic: services, calculators, utility functions |

Feature tests are the primary layer; the majority of test investment is in Feature tests that exercise the real application stack.

## Running Tests

```bash
cd backend

# Run all tests
php artisan test

# Run a specific test file
php artisan test tests/Feature/TaxEngineIntegrationTest.php

# Run tests matching a name pattern
php artisan test --filter=tax
```

## Feature Test Structure

Feature tests extend `Tests\TestCase` and typically use the `RefreshDatabase` trait to reset the database state between test cases. A standard Feature test follows this pattern:

```php
class CreateAssetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser(); // Sets up a session for the test user
    }

    public function test_creates_asset_with_valid_data(): void
    {
        $response = $this->postJson('/api/v2/assets', [
            'name' => 'Server Rack A',
            'purchase_value' => 12000.00,
            'purchase_date' => '2026-01-01',
            'depreciation_method' => 'straight_line',
            'useful_life_years' => 5,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure(['id']);
    }
}
```

The `authenticateUser()` helper method on `TestCase` establishes an authenticated session so that protected endpoints pass the `ApiAuth` middleware check.

## Factory Reference

Factories are defined in `backend/database/factories/`. Each domain model has a corresponding factory. Key factories include:

| Factory | Model | Domain |
|---------|-------|--------|
| `AssetFactory` | Asset | Assets |
| `EmployeeFactory` | Employee | HumanCapital |
| `InvoiceFactory` | Invoice | Commercial |
| `GeneralLedgerFactory` | GeneralLedger | Finance |
| `FiscalPeriodFactory` | FiscalPeriod | Finance |
| `ChartOfAccountFactory` | ChartOfAccount | Finance |
| `UserFactory` | User | EnterpriseCore |
| `ProductFactory` | Product | SupplyChain |

## Using Factories

```php
// Create a persisted model instance
$asset = Asset::factory()->create([
    'depreciation_method' => 'declining_balance',
    'useful_life_years' => 3,
]);

// Create an in-memory (unpersisted) instance
$assetData = Asset::factory()->make()->toArray();

// Create multiple instances
$assets = Asset::factory()->count(5)->create();
```

## Testing Financial Calculations

When testing depreciation, tax calculations, or GL postings, always seed the minimum required master data in `setUp()`:

- ChartOfAccount entries for the account types being tested
- A FiscalPeriod record covering the test date range
- A Currency record with the base currency (is_primary = true)

The `TaxEngineIntegrationTest` in the Feature test suite is the reference example for integration test setup involving financial master data.

## What to Test

For every new Action class, write tests covering:
1. **Happy path:** Valid input creates/updates/deletes the record and returns the correct envelope.
2. **Authorization failure:** Unauthenticated request returns `401`; insufficient permission returns `403`.
3. **Validation failure:** Missing required fields return `400` with `success: false`.
4. **Business rule violation:** Invalid state transitions or constraint violations return appropriate errors.
