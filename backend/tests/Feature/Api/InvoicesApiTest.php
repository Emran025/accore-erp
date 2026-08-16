<?php

namespace Tests\Feature\Api;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\SupplyChain\Inventory\Models\Product;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoicesApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
        Module::query()->where('module_key', 'sales')->update(['is_active' => true]);
        $this->createReadyOperatingContext($this->authenticatedUser);
        $this->seedChartOfAccounts();

        // Create fiscal period for current date
        FiscalPeriod::factory()->create([
            'start_date' => Carbon::now()->startOfYear()->format('Y-m-d'),
            'end_date' => Carbon::now()->endOfYear()->format('Y-m-d'),
            'is_closed' => false,
            'is_locked' => false,
        ]);
    }

    public function test_can_list_invoices()
    {
        Invoice::factory()->count(5)->create();

        $response = $this->authGet(route('v2.invoices.index'));

        $this->assertSuccessResponse($response);
        $response->assertJsonStructure(['success', 'data']);
        $response->assertJsonCount(5, 'data');
    }

    public function test_can_create_invoice()
    {
        $customer = ArCustomer::factory()->create();
        $product = Product::factory()->create([
            'unit_price' => 100,
            'stock_quantity' => 50,
            'weighted_average_cost' => 50,
            'minimum_profit_margin' => 10,
        ]);

        $data = [
            'customer_id' => $customer->id,
            'invoice_date' => now()->toDateString(),
            'payment_type' => 'cash',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_price' => 100,
                    'discount' => 0,
                    'tax_rate' => 0.15,
                ],
            ],
            'notes' => 'Test Invoice API',
        ];

        $response = $this->authPost(route('v2.invoices.store'), $data);

        $this->assertSuccessResponse($response);

        $invoiceId = $response->json('data.id');
        $this->assertDatabaseHas('invoices', ['id' => $invoiceId]);
        $this->assertDatabaseHas('invoice_items', [
            'invoice_id' => $invoiceId,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_can_get_invoice_details()
    {
        $invoice = Invoice::factory()->create();

        $response = $this->authGet(route('v2.invoices.details', ['id' => $invoice->id]));

        $this->assertSuccessResponse($response);
        $response->assertJson([
            'data' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
            ],
        ]);
    }

    // public function test_can_delete_invoice()
    // {
    //     $invoice = Invoice::factory()->create(['is_reversed' => false]);

    //     $response = $this->authDelete(route('v2.invoices.destroy'), ['id' => $invoice->id]);

    //     $this->assertSuccessResponse($response);

    //     // Assert invoice marked as reversed (soft delete logic for accounting)
    //     $this->assertTrue($invoice->fresh()->is_reversed);
    // }
}
