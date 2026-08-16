<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesQuotationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
        Module::query()->where('module_key', 'sales')->update(['is_active' => true]);
    }

    public function test_can_create_and_view_a_sales_quotation(): void
    {
        $response = $this->authPost(route('v2.sales.quotations.store'), [
            'customer_name' => 'Acme Trading Co.',
            'customer_contact' => 'Amina Al-Harbi',
            'customer_email' => 'amina@acme.test',
            'issue_date' => '2026-08-14',
            'valid_until' => '2026-09-13',
            'currency' => 'SAR',
            'tax_rate' => 15,
            'discount_amount' => 50,
            'scope_summary' => 'Point-of-sale equipment package.',
            'payment_terms' => 'Payment due on acceptance.',
            'terms_conditions' => 'Prices are valid during the stated period.',
            'items' => [
                [
                    'description' => 'POS terminal',
                    'sku' => 'POS-01',
                    'unit' => 'unit',
                    'quantity' => 2,
                    'unit_price' => 500,
                    'discount_amount' => 0,
                ],
                [
                    'description' => 'Optional installation service',
                    'unit' => 'service',
                    'quantity' => 1,
                    'unit_price' => 200,
                    'discount_amount' => 0,
                    'is_optional' => true,
                ],
            ],
        ]);

        $this->assertSuccessResponse($response, 201);
        $response->assertJsonPath('data.customer.name', 'Acme Trading Co.')
            ->assertJsonPath('data.subtotal', 1000)
            ->assertJsonPath('data.discount_amount', 50)
            ->assertJsonPath('data.tax_amount', 142.5)
            ->assertJsonPath('data.total_amount', 1092.5)
            ->assertJsonCount(2, 'data.items');

        $quotationId = $response->json('data.id');
        $this->assertDatabaseHas('sales_quotations', [
            'id' => $quotationId,
            'customer_name' => 'Acme Trading Co.',
            'status' => 'draft',
        ]);

        $showResponse = $this->authGet(route('v2.sales.quotations.show', $quotationId));
        $this->assertSuccessResponse($showResponse);
        $showResponse->assertJsonPath('data.quote_number', $response->json('data.quote_number'))
            ->assertJsonPath('data.items.1.is_optional', true);
    }

    public function test_can_update_quotation_status(): void
    {
        $createResponse = $this->authPost(route('v2.sales.quotations.store'), [
            'customer_name' => 'Northwind Stores',
            'issue_date' => '2026-08-14',
            'currency' => 'SAR',
            'items' => [[
                'description' => 'Inventory scanner',
                'quantity' => 1,
                'unit_price' => 350,
            ]],
        ]);

        $this->assertSuccessResponse($createResponse, 201);
        $quotationId = $createResponse->json('data.id');

        $response = $this->authPost(route('v2.sales.quotations.status', $quotationId), ['status' => 'sent']);

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.status', 'sent')
            ->assertJsonPath('data.sent_at', fn ($value) => $value !== null);
        $this->assertDatabaseHas('sales_quotations', ['id' => $quotationId, 'status' => 'sent']);
    }
}
