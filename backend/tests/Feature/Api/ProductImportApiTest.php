<?php

namespace Tests\Feature\Api;

use App\Domains\SupplyChain\Inventory\Models\Category;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProductImportApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_import_requires_approval_acknowledgment(): void
    {
        $payload = $this->payload();
        $payload['approval_acknowledged'] = false;

        $this->authPost(route('v2.inventory.products.import'), $payload)
            ->assertStatus(422);

        $this->assertDatabaseCount('products', 0);
    }

    public function test_import_replays_a_committed_batch_without_duplicate_products(): void
    {
        $payload = $this->payload();

        $firstResponse = $this->authPost(route('v2.inventory.products.import'), $payload);
        $this->assertSuccessResponse($firstResponse, 201)
            ->assertJsonPath('batch_id', $payload['batch_id'])
            ->assertJsonPath('replayed', false);

        $this->assertDatabaseHas('products', [
            'catalog_code' => $payload['rows'][0]['catalog_code'],
            'weighted_average_cost' => 12.5,
        ]);
        $this->assertDatabaseHas('inventory_costing', [
            'quantity' => 10,
            'unit_cost' => 12.5,
            'total_cost' => 125,
            'reference_type' => 'initial_stock',
        ]);

        $replayResponse = $this->authPost(route('v2.inventory.products.import'), $payload);
        $this->assertSuccessResponse($replayResponse, 201)
            ->assertJsonPath('batch_id', $payload['batch_id'])
            ->assertJsonPath('replayed', true);

        $this->assertDatabaseCount('products', 1);
        $this->assertDatabaseCount('product_import_batches', 1);
    }

    public function test_import_rejects_payload_changes_for_an_existing_batch_identifier(): void
    {
        $payload = $this->payload();
        $this->assertSuccessResponse($this->authPost(route('v2.inventory.products.import'), $payload), 201);

        $payload['rows'][0]['unit_price'] = 25;
        $this->authPost(route('v2.inventory.products.import'), $payload)
            ->assertStatus(422);

        $this->assertDatabaseCount('products', 1);
    }

    public function test_import_rejects_an_unknown_category_reference(): void
    {
        $payload = $this->payload();
        $payload['rows'][0]['category_id'] = 999999;

        $this->authPost(route('v2.inventory.products.import'), $payload)
            ->assertStatus(422);

        $this->assertDatabaseCount('products', 0);
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        $category = Category::factory()->create();

        return [
            'batch_id' => (string) Str::uuid(),
            'schema_version' => 'product-import.v1',
            'source_file' => 'opening-inventory.xlsx',
            'approval_acknowledged' => true,
            'approval_field_ids' => [
                'item_type',
                'catalog_code',
                'purchase_price',
                'stock_quantity',
                'inventory_control',
                'sellable',
                'taxable',
            ],
            'rows' => [[
                'name' => 'Imported opening inventory item',
                'catalog_code' => 'IMP-'.Str::upper(Str::random(10)),
                'category_id' => $category->id,
                'unit_price' => 20,
                'purchase_price' => 12.5,
                'stock_quantity' => 10,
                'low_stock_threshold' => 2,
                'unit_name' => 'piece',
                'items_per_unit' => 1,
                'item_type' => 'product',
                'inventory_control' => true,
                'sellable' => true,
                'taxable' => true,
            ]],
        ];
    }
}
