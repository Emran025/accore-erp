<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Persists business-module intent separately from operational activation.
 *
 * A selected module is an implementation choice. It remains inactive until
 * ModuleReadinessService confirms every structural, scope, and accounting
 * prerequisite for the selected working context.
 */
final class ModuleSelectionService
{
    public const SELECTED_MODULES_KEY = 'setup.selected_modules';

    /** @var list<string> */
    public const CONFIGURATION_MODULES = [
        'dashboard',
        'org_structure',
        'settings',
        'users',
        'roles_permissions',
    ];

    /**
     * These modules represent the four mandatory small-business domains:
     * enterprise core, commercial operations, finance, and supply chain.
     */
    public const CORE_STARTER_MODULES = ['sales', 'products', 'purchases', 'general_ledger'];

    public function __construct(
        private readonly ModuleReadinessService $readiness,
        private readonly OrganizationTemplateService $templates,
        private readonly OrgStructureService $orgStructureService,
    ) {}

    /** @return list<string> */
    public function selectedModuleKeys(): array
    {
        return self::selectedModuleKeysFromStore();
    }

    /**
     * Resolve explicit setup intent, falling back to already-active business
     * modules only when no selection record exists (legacy installation).
     *
     * @return list<string>
     */
    public static function selectedModuleKeysFromStore(bool $lockForUpdate = false): array
    {
        $query = Setting::query()->where('setting_key', self::SELECTED_MODULES_KEY);
        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $setting = $query->first();
        $selected = [];
        if ($setting) {
            $decoded = json_decode((string) $setting->setting_value, true);
            if (is_array($decoded)) {
                $selected = array_values(array_unique(array_filter(
                    $decoded,
                    static fn (mixed $key): bool => is_string($key)
                        && $key !== ''
                        && ! in_array($key, self::CONFIGURATION_MODULES, true)
                )));
            }
        }

        // Preserve previously active business modules until an explicit,
        // separately scoped deactivation workflow exists.
        $activeModuleKeys = Module::query()
            ->where('is_active', true)
            ->whereNotIn('module_key', self::CONFIGURATION_MODULES)
            ->orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('module_key')
            ->pluck('module_key')
            ->all();

        return array_values(array_unique([...$selected, ...$activeModuleKeys]));
    }

    /** @param list<string> $moduleKeys */
    public function select(array $moduleKeys, ?int $userId = null): array
    {
        $knownKeys = Module::query()->pluck('module_key')->all();
        $unknownKeys = array_values(array_diff($moduleKeys, $knownKeys));
        if ($unknownKeys !== []) {
            throw ValidationException::withMessages([
                'module_keys' => ['One or more selected modules do not exist.'],
            ]);
        }

        $selected = array_values(array_diff(
            array_values(array_unique($moduleKeys)),
            self::CONFIGURATION_MODULES
        ));
        if ($selected === []) {
            throw ValidationException::withMessages([
                'module_keys' => ['Select at least one business module.'],
            ]);
        }

        DB::transaction(function () use ($selected): void {
            Setting::updateOrCreate(
                ['setting_key' => self::SELECTED_MODULES_KEY],
                ['setting_value' => json_encode($selected, JSON_THROW_ON_ERROR)]
            );
        });

        return $this->state($userId);
    }

    /** @return array{activated: list<string>, pending: array<string, list<string>>} */
    public function activateSelected(?int $userId): array
    {
        return DB::transaction(function () use ($userId): array {
            $selected = self::selectedModuleKeysFromStore(lockForUpdate: true);
            if ($selected === []) {
                return ['activated' => [], 'pending' => []];
            }

            $modules = Module::query()
                ->whereIn('module_key', $selected)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('module_key');
            $readiness = $this->readiness->evaluate($userId, $selected);
            $evaluation = collect($readiness['modules'])->keyBy('module_key');
            $baselineReady = (bool) data_get($readiness, 'onboarding.baseline_ready', false);
            $activated = [];
            $pending = [];

            if (! $baselineReady) {
                $baselineReasons = array_values(array_unique(array_filter([
                    'mandatory_baseline_incomplete',
                    ...data_get($readiness, 'onboarding.phases.foundation.reason_codes', []),
                    ...data_get($readiness, 'onboarding.phases.core_operations.reason_codes', []),
                ], static fn (mixed $reason): bool => is_string($reason) && $reason !== '')));

                foreach ($selected as $moduleKey) {
                    $pending[$moduleKey] = $baselineReasons;
                }

                return compact('activated', 'pending');
            }

            foreach ($selected as $moduleKey) {
                $module = $modules->get($moduleKey);
                $status = $evaluation->get($moduleKey);

                if (! $module || ! $status) {
                    $pending[$moduleKey] = ['module_unknown'];

                    continue;
                }

                if (! $status['requirements_satisfied']) {
                    $pending[$moduleKey] = array_values(array_filter(
                        $status['reason_codes'],
                        static fn (string $reason): bool => $reason !== 'module_inactive'
                    ));

                    continue;
                }

                if (! $module->is_active) {
                    $module->update(['is_active' => true]);
                    $this->orgStructureService->recordChange(
                        'module',
                        $moduleKey,
                        'activated',
                        ['is_active' => false],
                        ['is_active' => true],
                        'Readiness checks passed for selected module activation.'
                    );
                }
                // If already active, skip write and audit entirely (idempotency on retry).

                $activated[] = $moduleKey;
            }

            return compact('activated', 'pending');
        });
    }

    /**
     * @return array{
     *   setup_required: bool,
     *   selected_module_keys: list<string>,
     *   active_module_keys: list<string>,
     *   pending_module_keys: list<string>,
     *   modules: list<array<string, mixed>>
     * }
     */
    public function state(?int $userId = null): array
    {
        $selected = $this->selectedModuleKeys();
        $readiness = $this->readiness->evaluate($userId, $selected);
        $evaluated = collect($readiness['modules']);
        $moduleNames = Module::query()
            ->get(['module_key', 'module_name_ar', 'module_name_en'])
            ->keyBy('module_key');
        $modules = $evaluated->map(function (array $module) use ($selected, $moduleNames): array {
            $catalogModule = $moduleNames->get($module['module_key']);
            $isConfigurationModule = in_array($module['module_key'], self::CONFIGURATION_MODULES, true);
            $isSelected = $isConfigurationModule || in_array($module['module_key'], $selected, true);
            $isOperational = $isConfigurationModule || ($isSelected && (bool) $module['ready']);

            return [
                ...$module,
                'module_name_ar' => $catalogModule?->module_name_ar,
                'module_name_en' => $catalogModule?->module_name_en,
                'is_configuration_module' => $isConfigurationModule,
                'is_selected' => $isSelected,
                'is_operational' => $isOperational,
                'lifecycle' => $isConfigurationModule
                    ? 'configuration_access'
                    : (! $isSelected ? 'not_selected' : ($isOperational ? 'active' : 'selected_pending_org_setup')),
            ];
        })->values();

        $selectedBusiness = $modules
            ->where('is_configuration_module', false)
            ->where('is_selected', true)
            ->values();
        $activeBusiness = $selectedBusiness->where('is_operational', true)->values();
        $pendingBusiness = $selectedBusiness->where('is_operational', false)->values();
        $baselineReady = (bool) data_get($readiness, 'onboarding.baseline_ready', false);
        $starterModuleKeys = array_values(array_unique(array_filter(
            data_get($readiness, 'onboarding.starter_module_keys', self::CORE_STARTER_MODULES),
            static fn (mixed $moduleKey): bool => is_string($moduleKey) && $moduleKey !== ''
        )));
        $activeStarterModules = $activeBusiness
            ->whereIn('module_key', $starterModuleKeys)
            ->pluck('module_key')
            ->all();
        $missingStarterModules = array_values(array_diff($starterModuleKeys, $activeStarterModules));
        $hasExplicitSelection = Setting::query()
            ->where('setting_key', self::SELECTED_MODULES_KEY)
            ->exists();
        $legacyInstallationHasActiveBusiness = ! $hasExplicitSelection
            && $selectedBusiness->contains(static fn (array $module): bool => (bool) ($module['is_active'] ?? false));
        if ($legacyInstallationHasActiveBusiness) {
            $missingStarterModules = [];
        }
        $starterBundleActive = $baselineReady && (
            $legacyInstallationHasActiveBusiness
            || ($starterModuleKeys !== [] && $missingStarterModules === [])
        );

        return [
            // New installs must activate the profile's mandatory starter set;
            // pending optional additions do not reopen an already launched baseline.
            // Legacy installations without explicit setup intent are preserved.
            'setup_required' => ! $starterBundleActive,
            'onboarding' => [
                ...($readiness['onboarding'] ?? []),
                'starter_bundle_active' => $starterBundleActive,
                'missing_starter_module_keys' => $missingStarterModules,
                'active_starter_module_keys' => $activeStarterModules,
            ],
            'selected_module_keys' => $selected,
            'active_module_keys' => $activeBusiness->pluck('module_key')->all(),
            'pending_module_keys' => $pendingBusiness->pluck('module_key')->all(),
            'requirement_queue' => $this->readiness->resolveRequirementQueue($selected),
            'modules' => $modules->all(),
            'organization_template' => $this->templates->state(),
        ];
    }

    public function isOperational(string $moduleKey, ?int $userId = null): bool
    {
        $state = $this->state($userId);
        $module = collect($state['modules'])->firstWhere('module_key', $moduleKey);

        return (bool) ($module['is_selected'] ?? false) && (bool) ($module['is_operational'] ?? false);
    }
}
