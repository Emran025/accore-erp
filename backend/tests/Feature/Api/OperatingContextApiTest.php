<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperatingContextApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_readiness_reports_missing_operating_prerequisites(): void
    {
        $response = $this->authGet(route('v2.operating_context.readiness'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.ready', false)
            ->assertJsonPath('data.next_action', 'org_node')
            ->assertJsonPath('data.checks.0.action_key', 'operating_context.readiness.org_node')
            ->assertJsonMissingPath('data.checks.0.action');
    }

    public function test_can_configure_an_operating_context_with_warehouse_and_pos(): void
    {
        $storeNode = $this->createActiveStoreNode($this->authenticatedUser);
        $costCenter = CostCenter::create([
            'code' => 'CC-STORE',
            'name' => 'Store Operations',
            'type' => 'operational',
            'is_active' => true,
        ]);
        $profitCenter = ProfitCenter::create([
            'code' => 'PC-STORE',
            'name' => 'Store Revenue',
            'type' => 'branch',
            'is_active' => true,
        ]);

        $response = $this->authPost(route('v2.operating_context.configure'), [
            'org_node_uuid' => $storeNode->node_uuid,
            'cost_center_id' => $costCenter->id,
            'profit_center_id' => $profitCenter->id,
            'warehouse' => [
                'code' => 'WH-STORE',
                'name' => 'Store Warehouse',
            ],
            'pos_terminal' => [
                'code' => 'POS-STORE',
                'name' => 'Store Counter',
            ],
        ]);

        $this->assertSuccessResponse($response, 201);
        $response->assertJsonPath('data.warehouse.code', 'WH-STORE')
            ->assertJsonPath('data.pos_terminal.code', 'POS-STORE')
            ->assertJsonPath('data.status', 'ready');

        $this->assertDatabaseHas('warehouses', ['code' => 'WH-STORE', 'is_active' => true]);
        $this->assertDatabaseHas('pos_terminals', ['code' => 'POS-STORE', 'is_active' => true]);
        $this->assertDatabaseCount('operating_contexts', 1);

        $context = OperatingContext::query()->firstOrFail();
        $this->assertTrue((bool) $context->is_default);
    }
}
