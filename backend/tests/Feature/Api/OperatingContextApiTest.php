<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
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

    public function test_user_can_list_and_switch_between_personal_and_organization_contexts(): void
    {
        $firstStore = $this->createReadyOperatingContext($this->authenticatedUser);
        $secondStore = $this->createReadyOperatingContext($this->authenticatedUser);
        $firstStore->update(['is_default' => false]);
        $organizationStore = $this->createReadyOperatingContext(User::factory()->create());
        $organizationStore->update(['user_id' => null, 'is_default' => true]);

        $listResponse = $this->authGet(route('v2.operating_context.contexts'));

        $this->assertSuccessResponse($listResponse);
        $listResponse->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.id', $secondStore->id)
            ->assertJsonPath('data.0.scope', 'personal')
            ->assertJsonPath('data.2.id', $organizationStore->id)
            ->assertJsonPath('data.2.scope', 'organization');

        $selectPersonalResponse = $this->authPost(
            route('v2.operating_context.select', ['id' => $firstStore->id])
        );
        $this->assertSuccessResponse($selectPersonalResponse);
        $this->assertDatabaseHas('operating_contexts', ['id' => $firstStore->id, 'is_default' => true]);
        $this->assertDatabaseHas('operating_contexts', ['id' => $secondStore->id, 'is_default' => false]);

        $selectOrganizationResponse = $this->authPost(
            route('v2.operating_context.select', ['id' => $organizationStore->id])
        );
        $this->assertSuccessResponse($selectOrganizationResponse);
        $this->assertDatabaseHas('operating_contexts', ['id' => $firstStore->id, 'is_default' => false]);
        $this->assertDatabaseHas('operating_contexts', ['id' => $organizationStore->id, 'is_default' => true]);

        $readinessResponse = $this->authGet(route('v2.operating_context.readiness'));
        $this->assertSuccessResponse($readinessResponse);
        $readinessResponse->assertJsonPath('data.context.id', $organizationStore->id);
    }

    public function test_can_configure_a_global_operating_context_with_warehouse_and_pos(): void
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
            'system_default' => true,
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
        $this->assertNull($context->user_id);
    }
}
