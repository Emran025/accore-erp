<?php

namespace Tests\Unit;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleReadinessService;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleSetupRequirementRegistry;
use PHPUnit\Framework\TestCase;

class ModuleSetupRequirementRegistryTest extends TestCase
{
    private ModuleSetupRequirementRegistry $registry;

    protected function setUp(): void
    {
        parent::setUp();
        $this->registry = new ModuleSetupRequirementRegistry();
    }

    public function test_registry_version_matches_onboarding_policy_version(): void
    {
        $this->assertSame(
            ModuleReadinessService::ONBOARDING_POLICY_VERSION,
            ModuleSetupRequirementRegistry::REGISTRY_VERSION,
        );
    }

    public function test_resolve_returns_deterministic_phase_order(): void
    {
        $queue = $this->registry->resolve(['sales', 'purchases'], 'guided_setup');

        $this->assertNotEmpty($queue);

        $phaseOrder = ['common_organization' => 0, 'cross_family' => 1, 'module_specific' => 2];
        $lastPhaseIndex = -1;

        foreach ($queue as $item) {
            $this->assertArrayHasKey('key', $item);
            $this->assertArrayHasKey('phase', $item);
            $this->assertContains($item['phase'], array_keys($phaseOrder));

            $phaseIndex = $phaseOrder[$item['phase']];
            $this->assertGreaterThanOrEqual(
                $lastPhaseIndex,
                $phaseIndex,
                "Phase order violated at key={$item['key']}: got {$item['phase']} after index {$lastPhaseIndex}"
            );
            $lastPhaseIndex = $phaseIndex;
        }
    }

    public function test_common_organization_phase_precedes_cross_family(): void
    {
        $queue = $this->registry->resolve(['sales', 'general_ledger'], 'guided_setup');
        $phases = array_column($queue, 'phase');

        $firstCrossFamily = array_search('cross_family', $phases, true);
        $lastCommonOrg = array_key_last(array_keys(array_filter(
            $phases,
            static fn (string $p): bool => $p === 'common_organization'
        )));

        if ($firstCrossFamily !== false && $lastCommonOrg !== null) {
            $this->assertGreaterThan($lastCommonOrg, $firstCrossFamily);
        }
    }

    public function test_cross_family_phase_precedes_module_specific(): void
    {
        $queue = $this->registry->resolve(['sales', 'purchases'], 'single_store_retail');
        $phases = array_column($queue, 'phase');

        $firstModuleSpecific = array_search('module_specific', $phases, true);
        $lastCrossFamily = null;
        foreach ($phases as $i => $p) {
            if ($p === 'cross_family') {
                $lastCrossFamily = $i;
            }
        }

        if ($firstModuleSpecific !== false && $lastCrossFamily !== null) {
            $this->assertGreaterThan($lastCrossFamily, $firstModuleSpecific);
        }
    }

    public function test_shared_requirement_appears_once_with_merged_owners(): void
    {
        // Both sales and purchases share common_organization requirements
        $queue = $this->registry->resolve(['sales', 'purchases'], 'guided_setup');
        $keys = array_column($queue, 'key');

        // No duplicate keys
        $this->assertSame(
            count($keys),
            count(array_unique($keys)),
            'Queue must not contain duplicate requirement keys'
        );

        // organizational_structure owned by both
        $orgStructureItem = collect($queue)->firstWhere('key', 'organizational_structure');
        $this->assertNotNull($orgStructureItem, 'organizational_structure must be present');

        $this->assertContains('sales', $orgStructureItem['required_by_module_keys']);
        $this->assertContains('purchases', $orgStructureItem['required_by_module_keys']);
    }

    public function test_retail_profile_includes_warehouse_and_pos_requirements(): void
    {
        $queue = $this->registry->resolve(['sales', 'purchases', 'products'], 'single_store_retail');
        $keys = array_column($queue, 'key');

        $this->assertContains('warehouse', $keys, 'single_store_retail must include warehouse requirement');
        $this->assertContains('pos_terminal', $keys, 'single_store_retail must include pos_terminal requirement');
        $this->assertContains('operating_context', $keys, 'single_store_retail must include operating_context requirement');
    }

    public function test_finance_only_profile_excludes_warehouse_and_pos(): void
    {
        // A finance-only selection with a non-retail profile should not include
        // warehouse or pos_terminal requirements.
        $queue = $this->registry->resolve(['general_ledger'], 'guided_setup');
        $keys = array_column($queue, 'key');

        $this->assertNotContains('warehouse', $keys, 'finance-only guided_setup must NOT include warehouse');
        $this->assertNotContains('pos_terminal', $keys, 'finance-only guided_setup must NOT include pos_terminal');
        $this->assertNotContains('operating_context', $keys, 'finance-only guided_setup must NOT include operating_context');
    }

    public function test_resolve_is_deterministic_across_multiple_calls(): void
    {
        $a = $this->registry->resolve(['sales', 'purchases', 'general_ledger'], 'guided_setup');
        $b = $this->registry->resolve(['general_ledger', 'purchases', 'sales'], 'guided_setup');

        $keysA = array_column($a, 'key');
        $keysB = array_column($b, 'key');

        $this->assertSame($keysA, $keysB, 'resolve() must return the same order regardless of input ordering');
    }

    public function test_resolve_deduplicates_owners_when_called_with_duplicated_module_keys(): void
    {
        $queue = $this->registry->resolve(['sales', 'sales', 'purchases'], 'guided_setup');
        $keys = array_column($queue, 'key');
        $this->assertSame(count($keys), count(array_unique($keys)));

        $orgStructure = collect($queue)->firstWhere('key', 'organizational_structure');
        $this->assertNotNull($orgStructure);
        // sales must appear only once even though it was passed twice
        $this->assertSame(
            count($orgStructure['required_by_module_keys']),
            count(array_unique($orgStructure['required_by_module_keys']))
        );
    }

    public function test_empty_module_selection_returns_empty_queue(): void
    {
        $queue = $this->registry->resolve([], 'guided_setup');
        $this->assertSame([], $queue);
    }

    public function test_all_items_have_required_shape(): void
    {
        $queue = $this->registry->resolve(['sales', 'purchases', 'general_ledger', 'hr'], 'single_store_retail');

        foreach ($queue as $item) {
            $this->assertArrayHasKey('key', $item);
            $this->assertArrayHasKey('phase', $item);
            $this->assertArrayHasKey('label_key', $item);
            $this->assertArrayHasKey('navigation_route_key', $item);
            $this->assertArrayHasKey('required_by_module_keys', $item);
            $this->assertArrayHasKey('order', $item);
            $this->assertArrayHasKey('conflicts', $item);
            $this->assertArrayHasKey('depends_on', $item);
            $this->assertIsString($item['key']);
            $this->assertIsString($item['phase']);
            $this->assertIsArray($item['required_by_module_keys']);
        }
    }
}
