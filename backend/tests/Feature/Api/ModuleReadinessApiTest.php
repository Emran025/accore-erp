<?php

namespace Tests\Feature\Api;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaType;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ModuleReadinessApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateUser();
        FiscalPeriod::query()->delete();
    }

    public function test_an_activated_module_is_blocked_until_its_required_structure_exists(): void
    {
        Module::create([
            'module_key' => 'test_finance_module',
            'module_name_ar' => 'وحدة مالية تجريبية',
            'module_name_en' => 'Test Finance Module',
            'category' => 'finance',
            'is_active' => true,
            'readiness_requirements' => [
                'requires_org_structure' => true,
                'required_node_types' => ['COMP_CODE'],
                'requires_operating_context' => false,
                'requires_open_fiscal_period' => true,
                'requires_chart_of_accounts' => true,
            ],
        ]);

        $blocked = $this->authGet(route('v2.org.module_readiness'));

        $this->assertSuccessResponse($blocked);
        $blocked->assertJsonPath('data.summary.configuration_ready', false)
            ->assertJsonPath('data.accounting_readiness.ready', false)
            ->assertJsonPath('data.accounting_readiness.open_fiscal_period.ready', false)
            ->assertJsonPath('data.accounting_readiness.chart_of_accounts.ready', false);
        $blockedModule = collect($blocked->json('data.modules'))->firstWhere('module_key', 'test_finance_module');
        $this->assertSame('blocked', $blockedModule['status']);
        $this->assertSame(['COMP_CODE'], $blockedModule['missing_node_types']);
        $this->assertContains('missing_required_structure', $blockedModule['reason_codes']);
        $this->assertContains('missing_open_fiscal_period', $blockedModule['reason_codes']);
        $this->assertContains('missing_chart_of_accounts', $blockedModule['reason_codes']);

        OrgMetaType::create([
            'id' => 'CLIENT',
            'display_name' => 'Client',
            'display_name_ar' => 'العميل',
            'level_domain' => 'Enterprise',
            'is_assignable' => true,
        ]);
        OrgMetaType::create([
            'id' => 'COMP_CODE',
            'display_name' => 'Company Code',
            'display_name_ar' => 'رمز الشركة',
            'level_domain' => 'Financial',
            'is_assignable' => true,
        ]);
        $client = StructureNode::create([
            'node_type_id' => 'CLIENT',
            'code' => 'CLIENT-1000',
            'status' => 'active',
        ]);
        $company = StructureNode::create([
            'node_type_id' => 'COMP_CODE',
            'code' => '1000',
            'status' => 'active',
        ]);
        DB::table('structure_links')->insert([
            'source_node_uuid' => $company->node_uuid,
            'target_node_uuid' => $client->node_uuid,
            'link_type' => 'assignment',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        FiscalPeriod::create([
            'period_name' => 'FY 2026',
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

        $ready = $this->authGet(route('v2.org.module_readiness'));

        $this->assertSuccessResponse($ready);
        $readyModule = collect($ready->json('data.modules'))->firstWhere('module_key', 'test_finance_module');
        $this->assertSame('ready', $readyModule['status']);
        $this->assertTrue($readyModule['ready']);
        $ready->assertJsonPath('data.accounting_readiness.ready', true);
        $this->assertSame([], $readyModule['missing_node_types']);
    }
}
