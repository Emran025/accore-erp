<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaType;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\SupplyChain\Inventory\Models\Warehouse;
use App\Domains\Commercial\SalesLifecycle\Models\PosTerminal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OperatingContextApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
    }

    public function test_readiness_requires_selected_working_unit_and_accounting_baseline(): void
    {
        $response = $this->authGet(route('v2.operating_context.readiness'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.ready', false)
            ->assertJsonPath('data.next_action', 'working_unit')
            ->assertJsonPath('data.checks.0.action_key', 'operating_context.readiness.working_unit')
            ->assertJsonPath('data.checks.5.key', 'organizational_structure')
            ->assertJsonPath('data.checks.5.complete', false)
            ->assertJsonPath('data.checks.6.key', 'open_fiscal_period')
            ->assertJsonPath('data.checks.7.key', 'chart_of_accounts')
            ->assertJsonPath('data.working_unit_readiness.ready', false)
            ->assertJsonPath('data.structural_readiness.ready', false)
            ->assertJsonPath('data.accounting_readiness.ready', false)
            ->assertJsonMissingPath('data.checks.0.action');
    }

    public function test_can_configure_a_ready_operating_context_only_after_structure_and_accounting_are_complete(): void
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

        FiscalPeriod::create([
            'period_name' => 'FY '.now()->year,
            'start_date' => now()->startOfYear()->toDateString(),
            'end_date' => now()->endOfYear()->toDateString(),
            'is_closed' => false,
            'is_locked' => false,
        ]);
        foreach (['asset', 'liability', 'equity', 'revenue', 'expense'] as $index => $type) {
            ChartOfAccount::create([
                'account_code' => (string) (1000 + $index * 1000),
                'account_name' => ucfirst($type),
                'account_type' => $type,
                'is_active' => true,
            ]);
        }

        $warehouse = Warehouse::create([
            'code' => 'WH-STORE',
            'name' => 'Store Warehouse',
            'org_node_uuid' => $company->node_uuid,
            'cost_center_id' => $costCenter->id,
            'profit_center_id' => $profitCenter->id,
            'status' => 'active',
            'is_active' => true,
        ]);
        $terminal = PosTerminal::create([
            'code' => 'POS-STORE',
            'name' => 'Store Counter',
            'org_node_uuid' => $company->node_uuid,
            'warehouse_id' => $warehouse->id,
            'cost_center_id' => $costCenter->id,
            'profit_center_id' => $profitCenter->id,
            'status' => 'active',
            'is_active' => true,
        ]);

        $response = $this->authPost(route('v2.operating_context.configure'), [
            'org_node_uuid' => $company->node_uuid,
            'cost_center_id' => $costCenter->id,
            'pos_terminal_id' => $terminal->id,
        ]);

        $this->assertSuccessResponse($response, 201);
        $response->assertJsonPath('data.warehouse.code', 'WH-STORE')
            ->assertJsonPath('data.pos_terminal.code', 'POS-STORE')
            ->assertJsonPath('data.status', 'ready');

        $this->assertDatabaseHas('warehouses', ['id' => $warehouse->id, 'is_active' => true]);
        $this->assertDatabaseHas('pos_terminals', ['id' => $terminal->id, 'is_active' => true]);
        $this->assertDatabaseCount('operating_contexts', 1);

        $context = OperatingContext::query()->firstOrFail();
        $this->assertTrue((bool) $context->is_default);
        $this->assertSame('ready', $context->status);

        $existingLinkResponse = $this->authPost(route('v2.operating_context.configure'), [
            'org_node_uuid' => $company->node_uuid,
            'cost_center_id' => $costCenter->id,
            'pos_terminal_id' => $context->pos_terminal_id,
        ]);

        $this->assertSuccessResponse($existingLinkResponse, 201);
        $existingLinkResponse->assertJsonPath('data.pos_terminal.code', 'POS-STORE')
            ->assertJsonPath('data.cost_center.id', $costCenter->id);
        $this->assertDatabaseCount('warehouses', 1);
        $this->assertDatabaseCount('pos_terminals', 1);
        $this->assertDatabaseCount('operating_contexts', 1);
    }
}
