<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaType;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use Illuminate\Support\Facades\DB;
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
            ->assertJsonPath('data.next_action', 'warehouse')
            ->assertJsonPath('data.checks.0.action_key', 'operating_context.readiness.warehouse')
            ->assertJsonPath('data.checks.4.key', 'organizational_structure')
            ->assertJsonPath('data.checks.4.complete', false)
            ->assertJsonPath('data.structural_readiness.ready', false)
            ->assertJsonMissingPath('data.checks.0.action');
    }

    public function test_can_configure_an_operating_context_with_warehouse_and_pos(): void
    {
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

        foreach ([
            ['id' => 'COMP_CODE', 'display_name' => 'Company Code', 'display_name_ar' => 'رمز الشركة', 'level_domain' => 'Financial'],
            ['id' => 'CONTROLLING_AREA', 'display_name' => 'Controlling Area', 'display_name_ar' => 'منطقة التحكم', 'level_domain' => 'Financial'],
            ['id' => 'COST_CENTER', 'display_name' => 'Cost Center', 'display_name_ar' => 'مركز التكلفة', 'level_domain' => 'Controlling'],
            ['id' => 'PROFIT_CENTER', 'display_name' => 'Profit Center', 'display_name_ar' => 'مركز الربح', 'level_domain' => 'Controlling'],
        ] as $type) {
            OrgMetaType::create($type + ['is_assignable' => true]);
        }

        $company = StructureNode::create(['node_type_id' => 'COMP_CODE', 'code' => '1000', 'status' => 'active']);
        $controlling = StructureNode::create(['node_type_id' => 'CONTROLLING_AREA', 'code' => 'CA-1000', 'status' => 'active']);
        $costNode = StructureNode::create(['node_type_id' => 'COST_CENTER', 'code' => 'CC-STORE', 'status' => 'active']);
        $profitNode = StructureNode::create(['node_type_id' => 'PROFIT_CENTER', 'code' => 'PC-STORE', 'status' => 'active']);

        foreach ([
            [$controlling->node_uuid, $company->node_uuid],
            [$costNode->node_uuid, $controlling->node_uuid],
            [$profitNode->node_uuid, $controlling->node_uuid],
        ] as [$source, $target]) {
            DB::table('structure_links')->insert([
                'source_node_uuid' => $source,
                'target_node_uuid' => $target,
                'link_type' => 'assignment',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        DB::table('cost_centers')->where('id', $costCenter->id)->update(['structure_node_uuid' => $costNode->node_uuid]);
        DB::table('profit_centers')->where('id', $profitCenter->id)->update(['structure_node_uuid' => $profitNode->node_uuid]);

        $response = $this->authPost(route('v2.operating_context.configure'), [
            'org_node_uuid' => $company->node_uuid,
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
