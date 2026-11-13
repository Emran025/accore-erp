<?php

namespace Tests\Feature\Api;

use App\Domains\Commercial\SalesLifecycle\Models\PosTerminal;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaType;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleReadinessService;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleSelectionService;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrganizationTemplateService;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\SupplyChain\Inventory\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class SetupStateApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Module::query()->update(['is_active' => false]);
        Module::query()->whereIn('module_key', ModuleSelectionService::CONFIGURATION_MODULES)->update(['is_active' => true]);
        $this->authenticateUser();
    }

    public function test_fresh_installation_requires_explicit_business_module_selection(): void
    {
        $response = $this->authGet(route('v2.setup.state'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.setup_required', true)
            ->assertJsonPath('data.selected_module_keys', [])
            ->assertJsonPath('data.active_module_keys', [])
            ->assertJsonPath('data.onboarding.next_phase', 'foundation')
            ->assertJsonPath('data.onboarding.starter_bundle_active', false);
    }

    public function test_organization_template_catalog_is_available_before_the_profile_is_saved(): void
    {
        $response = $this->authGet(route('v2.setup.organization_templates'));

        $this->assertSuccessResponse($response);
        $response->assertJsonPath('data.is_applied', false)
            ->assertJsonPath('data.can_apply', false)
            ->assertJsonPath('data.templates.0.key', 'single_store_retail');
    }

    public function test_optional_reporting_module_cannot_bypass_the_mandatory_baseline(): void
    {
        $selected = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['reports'],
        ]);

        $this->assertSuccessResponse($selected);
        $selected->assertJsonPath('data.setup_required', true)
            ->assertJsonPath('data.selected_module_keys', ['reports']);

        $activated = $this->authPost(route('v2.setup.modules.activate_selected'));

        $this->assertSuccessResponse($activated);
        $activated->assertJsonPath('data.activation.activated', [])
            ->assertJsonPath('data.activation.pending.reports.0', 'mandatory_baseline_incomplete')
            ->assertJsonPath('data.state.setup_required', true);
        $pendingReasons = $activated->json('data.activation.pending.reports');
        $this->assertContains('missing_foundation_structure', $pendingReasons);
        $this->assertContains('missing_chart_of_accounts', $pendingReasons);
        $this->assertDatabaseHas('modules', ['module_key' => 'reports', 'is_active' => false]);
    }

    public function test_guided_setup_baseline_activates_the_starter_bundle_and_keeps_optional_projects_scoped(): void
    {
        $this->configureTechnologyCommerceBaseline();

        $state = $this->authGet(route('v2.setup.state'));
        $this->assertSuccessResponse($state);
        $state->assertJsonPath('data.onboarding.profile', 'guided_setup')
            ->assertJsonPath('data.onboarding.phases.foundation.ready', true)
            ->assertJsonPath('data.onboarding.phases.core_operations.ready', true)
            ->assertJsonPath('data.onboarding.next_phase', 'module_activation');

        $selection = [...ModuleSelectionService::CORE_STARTER_MODULES, 'projects'];
        $selected = $this->authPost(route('v2.setup.modules.select'), ['module_keys' => $selection]);
        $this->assertSuccessResponse($selected);

        $activated = $this->authPost(route('v2.setup.modules.activate_selected'));

        $this->assertSuccessResponse($activated);
        $activated->assertJsonPath('data.activation.activated', ModuleSelectionService::CORE_STARTER_MODULES)
            ->assertJsonPath('data.activation.pending.projects.0', 'missing_required_structure')
            ->assertJsonPath('data.state.setup_required', false)
            ->assertJsonPath('data.state.onboarding.starter_bundle_active', true);
        $this->assertEqualsCanonicalizing(
            ModuleSelectionService::CORE_STARTER_MODULES,
            $activated->json('data.state.onboarding.active_starter_module_keys')
        );

        $auditCount = DB::table('org_change_history')
            ->where('entity_type', 'module')
            ->where('change_type', 'activated')
            ->whereIn('entity_id', ModuleSelectionService::CORE_STARTER_MODULES)
            ->count();
        $this->assertSame(count(ModuleSelectionService::CORE_STARTER_MODULES), $auditCount);
        $this->assertDatabaseHas('org_change_history', [
            'entity_type' => 'module',
            'entity_id' => 'sales',
            'change_type' => 'activated',
            'changed_by' => $this->authenticatedUser?->id,
        ]);

        config()->set('organization.enforce_module_readiness_in_tests', true);
        $this->authGet(route('v2.invoices.index'))->assertOk();

        $repeatedActivation = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($repeatedActivation);
        $repeatedActivation->assertJsonPath('data.activation.activated', ModuleSelectionService::CORE_STARTER_MODULES);
        $this->assertSame($auditCount, DB::table('org_change_history')
            ->where('entity_type', 'module')
            ->where('change_type', 'activated')
            ->whereIn('entity_id', ModuleSelectionService::CORE_STARTER_MODULES)
            ->count());

        foreach (ModuleSelectionService::CORE_STARTER_MODULES as $moduleKey) {
            $this->assertDatabaseHas('modules', ['module_key' => $moduleKey, 'is_active' => true]);
        }
        $this->assertDatabaseHas('modules', ['module_key' => 'projects', 'is_active' => false]);
    }

    public function test_setup_rejects_empty_business_module_selection(): void
    {
        $response = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => [],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('module_keys');
    }

    public function test_selection_only_persists_intent_without_activating_or_deactivating_modules(): void
    {
        Module::query()->where('module_key', 'reports')->update(['is_active' => true]);

        $selected = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['sales'],
        ]);

        $this->assertSuccessResponse($selected);
        $this->assertEqualsCanonicalizing(['sales', 'reports'], $selected->json('data.selected_module_keys'));
        $this->assertDatabaseHas('modules', ['module_key' => 'sales', 'is_active' => false]);
        $this->assertDatabaseHas('modules', ['module_key' => 'reports', 'is_active' => true]);
    }

    public function test_requirement_queue_is_deterministic_deduplicated_and_conditional(): void
    {
        $readiness = app(ModuleReadinessService::class);

        // With the default guided_setup profile, sales+purchases do NOT trigger
        // retail-conditional requirements (warehouse, pos_terminal, PLANT, etc.)
        $queue = $readiness->resolveRequirementQueue(['sales', 'purchases', 'sales']);
        $this->assertSame($queue, $readiness->resolveRequirementQueue(['sales', 'purchases', 'sales']));
        $keys = array_column($queue, 'key');
        $phases = array_values(array_unique(array_column($queue, 'phase')));

        // No duplicates
        $this->assertCount(count(array_unique($keys)), $keys);
        // With guided_setup profile, only common_organization and cross_family phases appear
        // (working_unit is cross_family; module_specific only appears for retail/service profiles)
        $this->assertContains('common_organization', $phases);
        $this->assertContains('cross_family', $phases);
        // warehouse and pos_terminal are retail-conditional; not present for guided_setup
        $this->assertNotContains('pos_terminal', $keys);
        $this->assertNotContains('warehouse', $keys);
        $this->assertEqualsCanonicalizing(
            ['sales', 'purchases'],
            collect($queue)->firstWhere('key', 'node_type:COMP_CODE')['required_by_module_keys']
        );

        // Now switch to single_store_retail — retail requirements appear
        Setting::updateOrCreate(
            ['setting_key' => OrganizationTemplateService::PROFILE_KEY],
            ['setting_value' => json_encode(['template_key' => 'single_store_retail'], JSON_THROW_ON_ERROR)]
        );
        $retailQueue = $readiness->resolveRequirementQueue(['sales', 'purchases']);
        $retailKeys  = array_column($retailQueue, 'key');
        $retailPhases = array_values(array_unique(array_column($retailQueue, 'phase')));
        $this->assertContains('pos_terminal', $retailKeys);
        $this->assertContains('warehouse', $retailKeys);
        $this->assertSame(['common_organization', 'cross_family', 'module_specific'], $retailPhases);

        // Finance-only and HR-only should never surface retail/supply requirements
        // even when the profile is retail (non-applicable modules filter them out)
        foreach (['general_ledger', 'hr'] as $moduleKey) {
            $selected = $this->authPost(route('v2.setup.modules.select'), [
                'module_keys' => [$moduleKey],
            ]);

            $this->assertSuccessResponse($selected);
            $selected->assertJsonPath('data.onboarding.phases.core_operations.ready', true)
                ->assertJsonPath('data.onboarding.phases.core_operations.required_node_types', []);
            $selectedQueueKeys = array_column($selected->json('data.requirement_queue'), 'key');
            $this->assertNotContains('operating_context', $selectedQueueKeys);
            $this->assertNotContains('warehouse', $selectedQueueKeys);
            $this->assertNotContains('pos_terminal', $selectedQueueKeys);
            $this->assertContains('node_type:COST_CENTER', $selectedQueueKeys);
            if ($moduleKey === 'general_ledger') {
                $this->assertContains('node_type:PROFIT_CENTER', $selectedQueueKeys);
            } else {
                $this->assertNotContains('node_type:PROFIT_CENTER', $selectedQueueKeys);
            }
        }

        $inventoryKeys = array_column($readiness->resolveRequirementQueue(['products']), 'key');
        $this->assertContains('operating_context', $inventoryKeys);
        $this->assertContains('warehouse', $inventoryKeys);
        $this->assertNotContains('pos_terminal', $inventoryKeys);
        $this->assertNotContains('node_type:COST_CENTER', $inventoryKeys);
        $this->assertNotContains('node_type:PROFIT_CENTER', $inventoryKeys);
    }

    public function test_legacy_active_module_is_adopted_when_no_selection_record_exists(): void
    {
        Module::query()->where('module_key', 'sales')->update(['is_active' => true]);
        $this->configureTechnologyCommerceBaseline();

        $state = $this->authGet(route('v2.setup.state'));

        $this->assertSuccessResponse($state);
        $state->assertJsonPath('data.setup_required', false)
            ->assertJsonPath('data.selected_module_keys', ['sales']);
        $this->assertContains('sales', $state->json('data.active_module_keys'));
    }

    public function test_finance_and_hr_can_activate_without_retail_warehouse_or_pos(): void
    {
        Setting::updateOrCreate(
            ['setting_key' => OrganizationTemplateService::PROFILE_KEY],
            ['setting_value' => json_encode(['template_key' => 'single_store_retail'], JSON_THROW_ON_ERROR)]
        );
        $company = $this->configureFoundationWithoutOperatingResources();
        $warehouseCount = Warehouse::query()->count();
        $terminalCount = PosTerminal::query()->count();

        $financeSelection = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['general_ledger'],
        ]);
        $this->assertSuccessResponse($financeSelection);

        $financeActivation = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($financeActivation);
        $financeActivation->assertJsonPath('data.activation.activated', ['general_ledger'])
            ->assertJsonPath('data.activation.pending', []);
        $this->assertDatabaseHas('modules', ['module_key' => 'general_ledger', 'is_active' => true]);
        $this->assertSame($warehouseCount, Warehouse::query()->count());
        $this->assertSame($terminalCount, PosTerminal::query()->count());

        $this->addHrStructure($company);

        $hrSelection = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['hr'],
        ]);
        $this->assertSuccessResponse($hrSelection);

        $hrActivation = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($hrActivation);
        $this->assertEqualsCanonicalizing(['general_ledger', 'hr'], $hrActivation->json('data.activation.activated'));
        $this->assertSame([], $hrActivation->json('data.activation.pending'));
        $this->assertDatabaseHas('modules', ['module_key' => 'hr', 'is_active' => true]);
        $this->assertDatabaseHas('modules', ['module_key' => 'general_ledger', 'is_active' => true]);
        $this->assertSame($warehouseCount, Warehouse::query()->count());
        $this->assertSame($terminalCount, PosTerminal::query()->count());
    }

    public function test_hr_only_can_activate_without_retail_warehouse_or_pos(): void
    {
        Setting::updateOrCreate(
            ['setting_key' => OrganizationTemplateService::PROFILE_KEY],
            ['setting_value' => json_encode(['template_key' => 'single_store_retail'], JSON_THROW_ON_ERROR)]
        );
        $company = $this->configureFoundationWithoutOperatingResources();
        $this->addHrStructure($company);

        $selected = $this->authPost(route('v2.setup.modules.select'), ['module_keys' => ['hr']]);
        $this->assertSuccessResponse($selected);
        $activated = $this->authPost(route('v2.setup.modules.activate_selected'));

        $this->assertSuccessResponse($activated);
        $activated->assertJsonPath('data.activation.activated', ['hr'])
            ->assertJsonPath('data.activation.pending', []);
        $this->assertDatabaseHas('modules', ['module_key' => 'hr', 'is_active' => true]);
        $this->assertDatabaseHas('modules', ['module_key' => 'general_ledger', 'is_active' => false]);
        $this->assertSame(0, Warehouse::query()->count());
        $this->assertSame(0, PosTerminal::query()->count());
    }

    public function test_finance_and_hr_can_save_ready_context_without_warehouse_or_pos(): void
    {
        Setting::updateOrCreate(
            ['setting_key' => OrganizationTemplateService::PROFILE_KEY],
            ['setting_value' => json_encode(['template_key' => 'single_store_retail'], JSON_THROW_ON_ERROR)]
        );
        $company = $this->configureFoundationWithoutOperatingResources();
        $this->addHrStructure($company);

        $costNode = StructureNode::query()->where('code', 'FIN-CC')->firstOrFail();
        $profitNode = StructureNode::query()->where('code', 'FIN-PC')->firstOrFail();
        $costCenter = CostCenter::create([
            'code' => 'FIN-CC-RECORD',
            'name' => 'Finance and HR Cost Center',
            'type' => 'operational',
            'structure_node_uuid' => $costNode->node_uuid,
            'is_active' => true,
        ]);
        $profitCenter = ProfitCenter::create([
            'code' => 'FIN-PC-RECORD',
            'name' => 'Finance Profit Center',
            'type' => 'business',
            'structure_node_uuid' => $profitNode->node_uuid,
            'is_active' => true,
        ]);

        foreach ([['general_ledger'], ['hr']] as $moduleKeys) {
            $selection = $this->authPost(route('v2.setup.modules.select'), ['module_keys' => $moduleKeys]);
            $this->assertSuccessResponse($selection);

            $payload = [
                'org_node_uuid' => $company->node_uuid,
                'cost_center_id' => $costCenter->id,
                'profit_center_id' => $moduleKeys === ['general_ledger'] ? $profitCenter->id : null,
            ];
            $saved = $this->authPost(route('v2.operating_context.configure'), $payload);

            $this->assertSuccessResponse($saved, 201);
            $context = OperatingContext::query()->where('user_id', $this->authenticatedUser?->id)->firstOrFail();
            $this->assertSame('ready', $context->status);
            $this->assertNull($context->warehouse_id);
            $this->assertNull($context->pos_terminal_id);
            $this->assertSame($costCenter->id, $context->cost_center_id);
            $this->assertSame($moduleKeys === ['general_ledger'] ? $profitCenter->id : null, $context->profit_center_id);

            $readiness = $this->authGet(route('v2.operating_context.readiness'));
            $this->assertSuccessResponse($readiness);
            $readiness->assertJsonPath('data.ready', true)
                ->assertJsonPath('data.checks.1.complete', true)
                ->assertJsonPath('data.checks.3.complete', true)
                ->assertJsonPath('data.checks.7.key', 'profit_center')
                ->assertJsonPath('data.checks.7.complete', true);
            if ($moduleKeys === ['general_ledger']) {
                DB::table('profit_centers')->where('id', $profitCenter->id)->update(['is_active' => false]);
                $inactiveProfitReadiness = $this->authGet(route('v2.operating_context.readiness'));
                $this->assertSuccessResponse($inactiveProfitReadiness);
                $inactiveProfitReadiness->assertJsonPath('data.ready', false)
                    ->assertJsonPath('data.checks.7.complete', false);
                DB::table('profit_centers')->where('id', $profitCenter->id)->update(['is_active' => true]);
            }
            $this->assertDatabaseCount('warehouses', 0);
            $this->assertDatabaseCount('pos_terminals', 0);
        }
    }

    public function test_inventory_only_context_uses_an_existing_warehouse_without_a_pos_terminal(): void
    {
        Setting::updateOrCreate(
            ['setting_key' => OrganizationTemplateService::PROFILE_KEY],
            ['setting_value' => json_encode(['template_key' => 'single_store_retail'], JSON_THROW_ON_ERROR)]
        );
        $this->configureTechnologyCommerceBaseline();
        $company = StructureNode::query()->where('code', 'TECH-1000')->firstOrFail();
        $warehouse = Warehouse::query()->firstOrFail();
        $warehouseCount = Warehouse::query()->count();
        $terminalCount = PosTerminal::query()->count();

        $selection = $this->authPost(route('v2.setup.modules.select'), ['module_keys' => ['products']]);
        $this->assertSuccessResponse($selection);
        $selectedRequirementKeys = array_column($selection->json('data.requirement_queue'), 'key');
        $this->assertContains('warehouse', $selectedRequirementKeys);
        $this->assertNotContains('pos_terminal', $selectedRequirementKeys);
        $this->assertNotContains('node_type:COST_CENTER', $selectedRequirementKeys);

        $saved = $this->authPost(route('v2.operating_context.configure'), [
            'org_node_uuid' => $company->node_uuid,
            'warehouse_id' => $warehouse->id,
            'pos_terminal_id' => null,
        ]);

        $this->assertSuccessResponse($saved, 201);
        $context = OperatingContext::query()->where('user_id', $this->authenticatedUser?->id)->firstOrFail();
        $this->assertSame('ready', $context->status);
        $this->assertSame($warehouse->id, $context->warehouse_id);
        $this->assertNull($context->pos_terminal_id);

        $readiness = $this->authGet(route('v2.operating_context.readiness'));
        $this->assertSuccessResponse($readiness);
        $readiness->assertJsonPath('data.ready', true)
            ->assertJsonPath('data.checks.1.complete', true)
            ->assertJsonPath('data.checks.3.complete', true);
        $this->assertSame($warehouseCount, Warehouse::query()->count());
        $this->assertSame($terminalCount, PosTerminal::query()->count());
    }

    public function test_hr_only_readiness_does_not_require_a_profit_center_but_general_ledger_does(): void
    {
        $company = $this->configureFoundationWithoutOperatingResources(false);
        $this->addHrStructure($company);

        $hrSelection = $this->authPost(route('v2.setup.modules.select'), ['module_keys' => ['hr']]);
        $this->assertSuccessResponse($hrSelection);
        $hrActivation = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($hrActivation);
        $hrActivation->assertJsonPath('data.activation.activated', ['hr'])
            ->assertJsonPath('data.activation.pending', []);

        $financeSelection = $this->authPost(route('v2.setup.modules.select'), ['module_keys' => ['general_ledger']]);
        $this->assertSuccessResponse($financeSelection);
        $financeActivation = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($financeActivation);
        $financeActivation->assertJsonPath('data.state.setup_required', true);
        $this->assertContains('missing_foundation_structure', $financeActivation->json('data.activation.pending.general_ledger'));
        $this->assertDatabaseHas('modules', ['module_key' => 'hr', 'is_active' => true]);
        $this->assertDatabaseHas('modules', ['module_key' => 'general_ledger', 'is_active' => false]);
    }

    public function test_selecting_a_module_does_not_activate_it(): void
    {
        $response = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['sales', 'purchases', 'products'],
        ]);

        $this->assertSuccessResponse($response);

        foreach (['sales', 'purchases', 'products'] as $moduleKey) {
            $this->assertDatabaseHas('modules', ['module_key' => $moduleKey, 'is_active' => false]);
        }
    }

    public function test_activation_retry_is_idempotent_and_emits_audit_once(): void
    {
        $this->configureTechnologyCommerceBaseline();

        $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ModuleSelectionService::CORE_STARTER_MODULES,
        ]);

        // First activation
        $first = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($first);
        $this->assertEqualsCanonicalizing(
            ModuleSelectionService::CORE_STARTER_MODULES,
            $first->json('data.activation.activated')
        );

        $auditCountAfterFirst = DB::table('org_change_history')
            ->where('entity_type', 'module')
            ->where('change_type', 'activated')
            ->whereIn('entity_id', ModuleSelectionService::CORE_STARTER_MODULES)
            ->count();
        $this->assertSame(count(ModuleSelectionService::CORE_STARTER_MODULES), $auditCountAfterFirst);

        // Second activation (retry) — must not add more audit rows
        $second = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($second);
        $this->assertEqualsCanonicalizing(
            ModuleSelectionService::CORE_STARTER_MODULES,
            $second->json('data.activation.activated')
        );

        $auditCountAfterRetry = DB::table('org_change_history')
            ->where('entity_type', 'module')
            ->where('change_type', 'activated')
            ->whereIn('entity_id', ModuleSelectionService::CORE_STARTER_MODULES)
            ->count();
        $this->assertSame($auditCountAfterFirst, $auditCountAfterRetry,
            'Retry activation must not emit duplicate audit events');
    }

    public function test_failed_activation_audit_write_rolls_back_module_activation_and_audit_rows(): void
    {
        $this->configureTechnologyCommerceBaseline();
        $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ModuleSelectionService::CORE_STARTER_MODULES,
        ]);
        $auditCountBefore = DB::table('org_change_history')
            ->where('entity_type', 'module')
            ->where('change_type', 'activated')
            ->count();

        DB::listen(static function (QueryExecuted $query): void {
            if (preg_match('/insert\s+into\s+[`"]?org_change_history/i', $query->sql) === 1) {
                throw new RuntimeException('Injected audit write failure.');
            }
        });
        $this->withoutExceptionHandling();

        $thrown = false;
        try {
            $this->authPost(route('v2.setup.modules.activate_selected'));
        } catch (RuntimeException $exception) {
            $thrown = $exception->getMessage() === 'Injected audit write failure.';
        }

        $this->assertTrue($thrown, 'The injected audit failure should escape the activation transaction.');
        foreach (ModuleSelectionService::CORE_STARTER_MODULES as $moduleKey) {
            $this->assertDatabaseHas('modules', ['module_key' => $moduleKey, 'is_active' => false]);
        }
        $this->assertSame($auditCountBefore, DB::table('org_change_history')
            ->where('entity_type', 'module')
            ->where('change_type', 'activated')
            ->count());
    }

    public function test_later_retail_inventory_and_hr_additions_preserve_existing_resources_and_context(): void
    {
        $this->configureTechnologyCommerceBaseline();
        $company = StructureNode::query()->where('code', 'TECH-1000')->firstOrFail();

        $this->authPost(route('v2.setup.modules.select'), ['module_keys' => ['general_ledger']]);
        $initialActivation = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($initialActivation);
        $initialActivation->assertJsonPath('data.activation.activated', ['general_ledger']);

        $snapshot = static fn (): array => [
            'warehouse_ids' => Warehouse::query()->orderBy('id')->pluck('id')->all(),
            'terminal_ids' => PosTerminal::query()->orderBy('id')->pluck('id')->all(),
            'cost_center_ids' => CostCenter::query()->orderBy('id')->pluck('id')->all(),
            'profit_center_ids' => ProfitCenter::query()->orderBy('id')->pluck('id')->all(),
            'contexts' => OperatingContext::query()->orderBy('id')->get([
                'id', 'org_node_uuid', 'warehouse_id', 'pos_terminal_id', 'cost_center_id', 'profit_center_id', 'status', 'is_default',
            ])->map(fn (OperatingContext $context): array => $context->only([
                'id', 'org_node_uuid', 'warehouse_id', 'pos_terminal_id', 'cost_center_id', 'profit_center_id', 'status', 'is_default',
            ]))->all(),
        ];
        $existingResources = $snapshot();

        Setting::updateOrCreate(
            ['setting_key' => OrganizationTemplateService::PROFILE_KEY],
            ['setting_value' => json_encode(['template_key' => 'single_store_retail'], JSON_THROW_ON_ERROR)]
        );
        $retailSelection = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['general_ledger', 'sales', 'products', 'purchases'],
        ]);
        $this->assertSuccessResponse($retailSelection);
        $retailActivation = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($retailActivation);
        $this->assertEqualsCanonicalizing(
            ['sales', 'products', 'purchases'],
            array_values(array_intersect(['sales', 'products', 'purchases'], $retailActivation->json('data.activation.activated'))),
        );
        $this->assertSame($existingResources, $snapshot());

        $this->addHrStructure($company);
        $hrSelection = $this->authPost(route('v2.setup.modules.select'), [
            'module_keys' => ['general_ledger', 'sales', 'products', 'purchases', 'hr'],
        ]);
        $this->assertSuccessResponse($hrSelection);
        $hrActivation = $this->authPost(route('v2.setup.modules.activate_selected'));
        $this->assertSuccessResponse($hrActivation);
        $this->assertContains('hr', $hrActivation->json('data.activation.activated'));
        $this->assertSame($existingResources, $snapshot());
    }

    public function test_legacy_installation_adopts_active_modules_without_first_run(): void
    {
        // Manually activate some modules without any selection record
        Module::query()
            ->whereIn('module_key', ['sales', 'general_ledger'])
            ->update(['is_active' => true]);

        // No setting record for SELECTED_MODULES_KEY exists

        $state = $this->authGet(route('v2.setup.state'));

        $this->assertSuccessResponse($state);

        $selectedKeys = $state->json('data.selected_module_keys');
        $this->assertContains('sales', $selectedKeys);
        $this->assertContains('general_ledger', $selectedKeys);

        // Setup is not reopened solely because of adopted modules — the
        // baseline readiness (fiscal period, COA, org structure) governs that.
        // We only assert the modules appear as selected.
        $this->assertNotEmpty($selectedKeys);
    }

    private function configureTechnologyCommerceBaseline(): void
    {
        foreach (['CLIENT', 'COMP_CODE', 'CONTROLLING_AREA', 'COST_CENTER', 'PROFIT_CENTER', 'PLANT', 'STORAGE_LOC', 'SALES_ORG', 'PURCH_ORG'] as $type) {
            OrgMetaType::create([
                'id' => $type,
                'display_name' => $type,
                'display_name_ar' => $type,
                'level_domain' => 'Technology Commerce',
                'is_assignable' => true,
            ]);
        }

        $client = StructureNode::create(['node_type_id' => 'CLIENT', 'code' => 'TECH-CLIENT', 'status' => 'active']);
        $company = StructureNode::create(['node_type_id' => 'COMP_CODE', 'code' => 'TECH-1000', 'status' => 'active']);
        $controlling = StructureNode::create(['node_type_id' => 'CONTROLLING_AREA', 'code' => 'TECH-CA', 'status' => 'active']);
        $costNode = StructureNode::create(['node_type_id' => 'COST_CENTER', 'code' => 'TECH-CC', 'status' => 'active']);
        $profitNode = StructureNode::create(['node_type_id' => 'PROFIT_CENTER', 'code' => 'TECH-PC', 'status' => 'active']);
        $plant = StructureNode::create(['node_type_id' => 'PLANT', 'code' => 'TECH-HUB', 'status' => 'active']);
        $storage = StructureNode::create(['node_type_id' => 'STORAGE_LOC', 'code' => 'TECH-STOCK', 'status' => 'active']);
        $sales = StructureNode::create(['node_type_id' => 'SALES_ORG', 'code' => 'TECH-SALES', 'status' => 'active']);
        $purchasing = StructureNode::create(['node_type_id' => 'PURCH_ORG', 'code' => 'TECH-BUY', 'status' => 'active']);

        foreach ([
            [$company, $client],
            [$controlling, $company],
            [$costNode, $controlling],
            [$profitNode, $controlling],
            [$plant, $company],
            [$storage, $plant],
            [$sales, $company],
            [$purchasing, $company],
        ] as [$source, $target]) {
            DB::table('structure_links')->insert([
                'source_node_uuid' => $source->node_uuid,
                'target_node_uuid' => $target->node_uuid,
                'link_type' => 'assignment',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $costCenter = CostCenter::create([
            'code' => 'TECH-CC',
            'name' => 'Technology Operations',
            'type' => 'operational',
            'structure_node_uuid' => $costNode->node_uuid,
            'is_active' => true,
        ]);
        $profitCenter = ProfitCenter::create([
            'code' => 'TECH-PC',
            'name' => 'Technology Retail',
            'type' => 'branch',
            'structure_node_uuid' => $profitNode->node_uuid,
            'is_active' => true,
        ]);

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
            'code' => 'TECH-WH',
            'name' => 'Technology Device Warehouse',
            'org_node_uuid' => $company->node_uuid,
            'cost_center_id' => $costCenter->id,
            'profit_center_id' => $profitCenter->id,
            'status' => 'active',
            'is_active' => true,
        ]);
        $terminal = PosTerminal::create([
            'code' => 'TECH-POS',
            'name' => 'Technology Showroom POS',
            'org_node_uuid' => $company->node_uuid,
            'warehouse_id' => $warehouse->id,
            'cost_center_id' => $costCenter->id,
            'profit_center_id' => $profitCenter->id,
            'status' => 'active',
            'is_active' => true,
        ]);

        $configured = $this->authPost(route('v2.operating_context.configure'), [
            'org_node_uuid' => $company->node_uuid,
            'cost_center_id' => $costCenter->id,
            'pos_terminal_id' => $terminal->id,
        ]);

        $this->assertSuccessResponse($configured, 201);
    }

    private function configureFoundationWithoutOperatingResources(bool $includeProfitCenter = true): StructureNode
    {
        $nodeTypes = ['CLIENT', 'COMP_CODE', 'CONTROLLING_AREA', 'COST_CENTER'];
        if ($includeProfitCenter) {
            $nodeTypes[] = 'PROFIT_CENTER';
        }
        foreach ($nodeTypes as $type) {
            OrgMetaType::create([
                'id' => $type,
                'display_name' => $type,
                'display_name_ar' => $type,
                'level_domain' => 'Finance and HR',
                'is_assignable' => true,
            ]);
        }

        $client = StructureNode::create(['node_type_id' => 'CLIENT', 'code' => 'FIN-CLIENT', 'status' => 'active']);
        $company = StructureNode::create(['node_type_id' => 'COMP_CODE', 'code' => 'FIN-1000', 'status' => 'active']);
        $controlling = StructureNode::create(['node_type_id' => 'CONTROLLING_AREA', 'code' => 'FIN-CA', 'status' => 'active']);
        $costCenter = StructureNode::create(['node_type_id' => 'COST_CENTER', 'code' => 'FIN-CC', 'status' => 'active']);
        $profitCenter = $includeProfitCenter
            ? StructureNode::create(['node_type_id' => 'PROFIT_CENTER', 'code' => 'FIN-PC', 'status' => 'active'])
            : null;

        $links = [
            [$company, $client],
            [$controlling, $company],
            [$costCenter, $controlling],
        ];
        if ($profitCenter) {
            $links[] = [$profitCenter, $controlling];
        }
        foreach ($links as [$source, $target]) {
            DB::table('structure_links')->insert([
                'source_node_uuid' => $source->node_uuid,
                'target_node_uuid' => $target->node_uuid,
                'link_type' => 'assignment',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        foreach (['asset', 'liability', 'equity', 'revenue', 'expense'] as $index => $type) {
            ChartOfAccount::create([
                'account_code' => (string) (11000 + $index * 1000),
                'account_name' => ucfirst($type),
                'account_type' => $type,
                'is_active' => true,
            ]);
        }

        \App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext::create([
            'user_id' => $this->authenticatedUser?->id,
            'org_node_uuid' => $company->node_uuid,
            'status' => 'draft',
            'is_default' => true,
        ]);

        return $company;
    }

    private function addHrStructure(StructureNode $company): void
    {
        foreach (['PERSONNEL_AREA', 'HR_ORG_UNIT'] as $type) {
            OrgMetaType::create([
                'id' => $type,
                'display_name' => $type,
                'display_name_ar' => $type,
                'level_domain' => 'Human Resources',
                'is_assignable' => true,
            ]);
        }

        $personnelArea = StructureNode::create(['node_type_id' => 'PERSONNEL_AREA', 'code' => 'FIN-PA', 'status' => 'active']);
        $hrOrgUnit = StructureNode::create(['node_type_id' => 'HR_ORG_UNIT', 'code' => 'FIN-HR', 'status' => 'active']);
        foreach ([[$personnelArea, $company], [$hrOrgUnit, $personnelArea]] as [$source, $target]) {
            DB::table('structure_links')->insert([
                'source_node_uuid' => $source->node_uuid,
                'target_node_uuid' => $target->node_uuid,
                'link_type' => 'assignment',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
