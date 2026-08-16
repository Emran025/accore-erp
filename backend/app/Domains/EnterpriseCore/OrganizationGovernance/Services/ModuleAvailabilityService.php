<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;

/**
 * Resolves operational module availability from the existing module catalogue
 * and the minimal setup selection stored in Settings.
 *
 * This service intentionally does not duplicate organizational data. A module
 * becomes operational only when it is explicitly active. Later readiness
 * policies may add stronger prerequisites before activation, while all routes
 * and clients keep a single availability contract.
 */
final class ModuleAvailabilityService
{
    public const SETUP_SELECTED_MODULES_KEY = 'setup.selected_modules';

    /**
     * These modules are needed to administer a new installation. They do not
     * bypass the separate first-run shell gate implemented by the client.
     *
     * @var list<string>
     */
    public const CORE_MODULE_KEYS = [
        'dashboard',
        'org_structure',
        'settings',
        'users',
        'roles_permissions',
    ];

    /**
     * @return list<string>
     */
    public function selectedModuleKeys(): array
    {
        $raw = Setting::query()
            ->where('setting_key', self::SETUP_SELECTED_MODULES_KEY)
            ->value('setting_value');

        if (! is_string($raw) || trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);

        if (! is_array($decoded)) {
            return [];
        }

        return array_values(array_unique(array_filter(
            $decoded,
            static fn (mixed $moduleKey): bool => is_string($moduleKey) && $moduleKey !== ''
        )));
    }

    /**
     * @return list<string>
     */
    public function activeModuleKeys(): array
    {
        return Module::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->pluck('module_key')
            ->all();
    }

    /**
     * @return array{
     *   module_key: string,
     *   exists: bool,
     *   lifecycle: 'not_selected'|'selected_pending_org_setup'|'active',
     *   is_selected: bool,
     *   is_operational: bool,
     *   remediation: string
     * }
     */
    public function availabilityFor(string $moduleKey): array
    {
        $module = Module::query()->where('module_key', $moduleKey)->first();
        $selected = in_array($moduleKey, $this->selectedModuleKeys(), true);

        if (! $module) {
            return [
                'module_key' => $moduleKey,
                'exists' => false,
                'lifecycle' => 'not_selected',
                'is_selected' => false,
                'is_operational' => false,
                'remediation' => 'module_unknown',
            ];
        }

        if ((bool) $module->is_active) {
            return [
                'module_key' => $moduleKey,
                'exists' => true,
                'lifecycle' => 'active',
                'is_selected' => $selected,
                'is_operational' => true,
                'remediation' => 'none',
            ];
        }

        return [
            'module_key' => $moduleKey,
            'exists' => true,
            'lifecycle' => $selected ? 'selected_pending_org_setup' : 'not_selected',
            'is_selected' => $selected,
            'is_operational' => false,
            'remediation' => $selected ? 'complete_organization_setup' : 'select_module',
        ];
    }

    public function isOperational(string $moduleKey): bool
    {
        return $this->availabilityFor($moduleKey)['is_operational'];
    }
}
