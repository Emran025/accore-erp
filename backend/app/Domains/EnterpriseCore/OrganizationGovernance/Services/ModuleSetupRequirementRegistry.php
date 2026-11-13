<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

/**
 * Typed, versioned descriptor for a single module setup requirement.
 */
final class RequirementDescriptor
{
    public function __construct(
        /** Stable machine key, used for deduplication */
        public readonly string $key,
        /** Phase bucket: common_organization | cross_family | module_specific */
        public readonly string $phase,
        /** Stable i18n translation key */
        public readonly string $label_key,
        /** Optional frontend navigation route key */
        public readonly ?string $navigation_route_key,
        /**
         * Which module keys this requirement is scoped to.
         * Empty list means ALL selected modules apply.
         *
         * @var list<string>
         */
        public readonly array $applicable_modules,
        /**
         * Optional condition evaluated at resolve time.
         * Signature: fn(array $selectedModuleKeys, string $profileKey): bool
         * When null the descriptor is always included.
         *
         * @var (callable(array<string>, string): bool)|null
         */
        public readonly mixed $condition,
        /** Deterministic sort order within the same phase */
        public readonly int $order,
        /**
         * Requirement keys that cannot coexist with this one (informational).
         *
         * @var list<string>
         */
        public readonly array $conflicts,
        /**
         * Requirement keys that must precede this one (informational).
         *
         * @var list<string>
         */
        public readonly array $depends_on,
    ) {}
}

/**
 * Canonical, versioned catalog of module setup requirements.
 *
 * Requirements are declared here rather than scattered across modules so that
 * the queue returned to the frontend is always deterministic, deduplicated,
 * and testable in isolation without touching the database.
 */
final class ModuleSetupRequirementRegistry
{
    /**
     * Must match ModuleReadinessService::ONBOARDING_POLICY_VERSION so that
     * callers can assert both live from the same constant.
     */
    public const REGISTRY_VERSION = ModuleReadinessService::ONBOARDING_POLICY_VERSION;

    /** Phase ordering used when sorting the resolved queue. */
    private const PHASE_ORDER = [
        'common_organization' => 0,
        'cross_family'        => 1,
        'module_specific'     => 2,
    ];

    /** @var list<RequirementDescriptor> */
    private array $catalog;

    public function __construct()
    {
        $this->catalog = $this->buildCatalog();
    }

    // ──────────────────────────────────────────────────────────────
    // Public API
    // ──────────────────────────────────────────────────────────────

    /**
     * Resolve a deduplicated, deterministically ordered requirement queue for
     * the given module selection and profile. The optional live descriptors
     * keep financial-center ownership aligned with the selected module catalog.
     *
     * @param  list<string>  $selectedModuleKeys
     * @return list<array{key: string, phase: string, label_key: string, navigation_route_key: string|null, required_by_module_keys: list<string>, order: int, conflicts: list<string>, depends_on: list<string>}>
     */
    public function resolve(array $selectedModuleKeys, string $profileKey, ?array $liveReadinessRequirements = null): array
    {
        $selectedModuleKeys = array_values(array_unique($selectedModuleKeys));
        if ($selectedModuleKeys === []) {
            return [];
        }

        /** @var array<string, array{descriptor: RequirementDescriptor, owners: list<string>}> */
        $seen = [];

        foreach ($this->catalog as $descriptor) {
            // Evaluate the condition gate first
            if ($descriptor->condition !== null
                && ! ($descriptor->condition)($selectedModuleKeys, $profileKey)) {
                continue;
            }

            // Determine which selected modules "own" this requirement
            if ($descriptor->applicable_modules === []) {
                // Applies to all selected modules
                $owners = $selectedModuleKeys;
            } else {
                $owners = array_values(array_intersect($selectedModuleKeys, $descriptor->applicable_modules));
                if ($owners === []) {
                    // No selected module matches → skip
                    continue;
                }
            }

            if ($liveReadinessRequirements !== null
                && in_array($descriptor->key, ['node_type:COST_CENTER', 'node_type:PROFIT_CENTER'], true)) {
                $nodeType = substr($descriptor->key, strlen('node_type:'));
                $owners = array_values(array_filter(
                    $owners,
                    fn (string $moduleKey): bool => $this->moduleRequiresDimension(
                        $moduleKey,
                        $nodeType,
                        $liveReadinessRequirements[$moduleKey] ?? [],
                    ),
                ));
                if ($owners === []) {
                    continue;
                }
            }

            if (isset($seen[$descriptor->key])) {
                // Merge owners (deduplication across multiple descriptor declarations)
                $seen[$descriptor->key]['owners'] = array_values(array_unique([
                    ...$seen[$descriptor->key]['owners'],
                    ...$owners,
                ]));
            } else {
                $seen[$descriptor->key] = [
                    'descriptor' => $descriptor,
                    'owners'     => $owners,
                ];
            }
        }

        // Build output and sort: phase order first, then descriptor order, then key
        $result = [];
        foreach ($seen as $key => ['descriptor' => $descriptor, 'owners' => $owners]) {
            sort($owners);
            $result[] = [
                'key'                    => $key,
                'phase'                  => $descriptor->phase,
                'label_key'              => $descriptor->label_key,
                'navigation_route_key'   => $descriptor->navigation_route_key,
                'required_by_module_keys' => $owners,
                'order'                  => $descriptor->order,
                'conflicts'              => $descriptor->conflicts,
                'depends_on'             => $descriptor->depends_on,
            ];
        }

        usort($result, function (array $a, array $b): int {
            $phaseA = self::PHASE_ORDER[$a['phase']] ?? 99;
            $phaseB = self::PHASE_ORDER[$b['phase']] ?? 99;
            if ($phaseA !== $phaseB) {
                return $phaseA <=> $phaseB;
            }

            if ($a['order'] !== $b['order']) {
                return $a['order'] <=> $b['order'];
            }

            return strcmp($a['key'], $b['key']);
        });

        return array_values($result);
    }

    // ──────────────────────────────────────────────────────────────
    // Catalog definition
    // ──────────────────────────────────────────────────────────────

    /** @return list<RequirementDescriptor> */
    private function buildCatalog(): array
    {
        return [
            // ── PHASE: common_organization ──────────────────────────
            new RequirementDescriptor(
                key: 'organizational_structure',
                phase: 'common_organization',
                label_key: 'setup.requirements.organizational_structure',
                navigation_route_key: 'org_structure',
                applicable_modules: [],
                condition: null,
                order: 10,
                conflicts: [],
                depends_on: [],
            ),
            new RequirementDescriptor(
                key: 'node_type:COMP_CODE',
                phase: 'common_organization',
                label_key: 'setup.requirements.company_code',
                navigation_route_key: 'org_structure.company',
                applicable_modules: [],
                condition: null,
                order: 20,
                conflicts: [],
                depends_on: ['organizational_structure'],
            ),
            new RequirementDescriptor(
                key: 'node_type:CONTROLLING_AREA',
                phase: 'common_organization',
                label_key: 'setup.requirements.controlling_area',
                navigation_route_key: 'org_structure.controlling',
                applicable_modules: [],
                condition: null,
                order: 30,
                conflicts: [],
                depends_on: ['node_type:COMP_CODE'],
            ),
            new RequirementDescriptor(
                key: 'node_type:COST_CENTER',
                phase: 'common_organization',
                label_key: 'setup.requirements.cost_center',
                navigation_route_key: 'org_structure.cost_center',
                applicable_modules: [],
                condition: null,
                order: 40,
                conflicts: [],
                depends_on: ['node_type:CONTROLLING_AREA'],
            ),
            new RequirementDescriptor(
                key: 'node_type:PROFIT_CENTER',
                phase: 'common_organization',
                label_key: 'setup.requirements.profit_center',
                navigation_route_key: 'org_structure.profit_center',
                applicable_modules: [],
                condition: null,
                order: 50,
                conflicts: [],
                depends_on: ['node_type:CONTROLLING_AREA'],
            ),

            // ── PHASE: cross_family ─────────────────────────────────
            new RequirementDescriptor(
                key: 'chart_of_accounts',
                phase: 'cross_family',
                label_key: 'setup.requirements.chart_of_accounts',
                navigation_route_key: 'finance.coa',
                applicable_modules: [],
                condition: null,
                order: 10,
                conflicts: [],
                depends_on: ['node_type:COMP_CODE'],
            ),
            new RequirementDescriptor(
                key: 'open_fiscal_period',
                phase: 'cross_family',
                label_key: 'setup.requirements.open_fiscal_period',
                navigation_route_key: 'finance.fiscal_periods',
                applicable_modules: [],
                condition: null,
                order: 20,
                conflicts: [],
                depends_on: ['chart_of_accounts'],
            ),
            new RequirementDescriptor(
                key: 'working_unit',
                phase: 'cross_family',
                label_key: 'setup.requirements.working_unit',
                navigation_route_key: 'org_structure.working_unit',
                applicable_modules: ['sales', 'purchases', 'products', 'general_ledger'],
                condition: null,
                order: 30,
                conflicts: [],
                depends_on: ['node_type:COMP_CODE'],
            ),
            new RequirementDescriptor(
                key: 'operating_context',
                phase: 'cross_family',
                label_key: 'setup.requirements.operating_context',
                navigation_route_key: 'org_structure.operating_context',
                applicable_modules: ['sales', 'purchases', 'products'],
                // Only for profiles that require an operating context
                condition: static function (array $selectedModuleKeys, string $profileKey): bool {
                    return in_array($profileKey, ['single_store_retail', 'multi_site_retail', 'manufacturing'], true);
                },
                order: 40,
                conflicts: [],
                depends_on: ['working_unit'],
            ),
            new RequirementDescriptor(
                key: 'warehouse',
                phase: 'cross_family',
                label_key: 'setup.requirements.warehouse',
                navigation_route_key: 'inventory.warehouses',
                applicable_modules: ['sales', 'purchases', 'products'],
                condition: static function (array $selectedModuleKeys, string $profileKey): bool {
                    return in_array($profileKey, ['single_store_retail', 'multi_site_retail', 'manufacturing'], true);
                },
                order: 50,
                conflicts: [],
                depends_on: ['operating_context'],
            ),
            new RequirementDescriptor(
                key: 'pos_terminal',
                phase: 'cross_family',
                label_key: 'setup.requirements.pos_terminal',
                navigation_route_key: 'sales.pos',
                applicable_modules: ['sales'],
                condition: static function (array $selectedModuleKeys, string $profileKey): bool {
                    return in_array($profileKey, ['single_store_retail', 'multi_site_retail', 'manufacturing'], true);
                },
                order: 60,
                conflicts: [],
                depends_on: ['warehouse'],
            ),

            // ── PHASE: module_specific ──────────────────────────────
            new RequirementDescriptor(
                key: 'node_type:PLANT',
                phase: 'module_specific',
                label_key: 'setup.requirements.plant',
                navigation_route_key: 'org_structure.plant',
                applicable_modules: ['sales', 'purchases', 'products'],
                condition: static function (array $selectedModuleKeys, string $profileKey): bool {
                    return in_array($profileKey, ['single_store_retail', 'multi_site_retail', 'manufacturing'], true);
                },
                order: 10,
                conflicts: [],
                depends_on: ['node_type:COMP_CODE'],
            ),
            new RequirementDescriptor(
                key: 'node_type:STORAGE_LOC',
                phase: 'module_specific',
                label_key: 'setup.requirements.storage_location',
                navigation_route_key: 'org_structure.storage',
                applicable_modules: ['purchases', 'products'],
                condition: static function (array $selectedModuleKeys, string $profileKey): bool {
                    return in_array($profileKey, ['single_store_retail', 'multi_site_retail', 'manufacturing'], true);
                },
                order: 20,
                conflicts: [],
                depends_on: ['node_type:PLANT'],
            ),
            new RequirementDescriptor(
                key: 'node_type:SALES_ORG',
                phase: 'module_specific',
                label_key: 'setup.requirements.sales_org',
                navigation_route_key: 'org_structure.sales_org',
                applicable_modules: ['sales'],
                condition: static function (array $selectedModuleKeys, string $profileKey): bool {
                    return in_array($profileKey, [
                        'single_store_retail', 'multi_site_retail', 'manufacturing',
                        'single_store_service', 'professional_services',
                    ], true);
                },
                order: 30,
                conflicts: [],
                depends_on: ['node_type:COMP_CODE'],
            ),
            new RequirementDescriptor(
                key: 'node_type:PURCH_ORG',
                phase: 'module_specific',
                label_key: 'setup.requirements.purch_org',
                navigation_route_key: 'org_structure.purch_org',
                applicable_modules: ['purchases'],
                condition: static function (array $selectedModuleKeys, string $profileKey): bool {
                    return in_array($profileKey, ['single_store_retail', 'multi_site_retail', 'manufacturing'], true);
                },
                order: 40,
                conflicts: [],
                depends_on: ['node_type:COMP_CODE'],
            ),
            new RequirementDescriptor(
                key: 'node_type:PERSONNEL_AREA',
                phase: 'module_specific',
                label_key: 'setup.requirements.personnel_area',
                navigation_route_key: 'org_structure.personnel_area',
                applicable_modules: ['hr'],
                condition: null,
                order: 50,
                conflicts: [],
                depends_on: ['node_type:COMP_CODE'],
            ),
            new RequirementDescriptor(
                key: 'node_type:HR_ORG_UNIT',
                phase: 'module_specific',
                label_key: 'setup.requirements.hr_org_unit',
                navigation_route_key: 'org_structure.hr_unit',
                applicable_modules: ['hr'],
                condition: null,
                order: 60,
                conflicts: [],
                depends_on: ['node_type:PERSONNEL_AREA'],
            ),
        ];
    }

    /**
     * Keep dimension requirements tied to selected module contracts. Payroll
     * and manufacturing allocate to cost center. Profit-center ownership follows the
     * live module readiness descriptors (e.g. GL, sales, purchasing, projects).
     *
     * @param array<string, mixed> $readinessRequirements
     */
    private function moduleRequiresDimension(
        string $moduleKey,
        string $nodeType,
        array $readinessRequirements,
    ): bool {
        $requiredNodeTypes = $readinessRequirements['required_node_types'] ?? [];
        if (is_array($requiredNodeTypes) && in_array($nodeType, $requiredNodeTypes, true)) {
            return true;
        }

        if ($nodeType !== 'COST_CENTER') {
            return false;
        }

        if (in_array($moduleKey, ['hr', 'payroll', 'manufacturing'], true)) {
            return true;
        }

        return false;
    }
}
