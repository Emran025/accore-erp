<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleActivationService;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleAvailabilityService;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SetupStateController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly ModuleAvailabilityService $moduleAvailability,
    ) {}

    public function show(): JsonResponse
    {
        return $this->successResponse((object) $this->state());
    }

    public function activateReadyModules(Request $request, ModuleActivationService $activation): JsonResponse
    {
        $result = $activation->activateReadySelected($request->user()?->id);

        return $this->successResponse((object) [
            'activation' => $result,
            'state' => $this->state(),
        ], 'Ready modules activated.');
    }

    public function selectModules(Request $request): JsonResponse
    {
        $knownModuleKeys = Module::query()->pluck('module_key')->all();

        $validated = $request->validate([
            'module_keys' => ['required', 'array', 'min:1'],
            'module_keys.*' => ['string', 'distinct', Rule::in($knownModuleKeys)],
        ]);

        $selected = array_values(array_diff(
            $validated['module_keys'],
            ModuleAvailabilityService::CORE_MODULE_KEYS
        ));

        DB::transaction(function () use ($selected) {
            Setting::updateOrCreate(
                ['setting_key' => ModuleAvailabilityService::SETUP_SELECTED_MODULES_KEY],
                ['setting_value' => json_encode($selected, JSON_THROW_ON_ERROR)]
            );
            Setting::updateOrCreate(
                ['setting_key' => 'setup.version'],
                ['setting_value' => '1']
            );
        });

        return $this->successResponse((object) $this->state(), 'Setup module selection saved.');
    }

    /**
     * @return array<string, mixed>
     */
    private function state(): array
    {
        $modules = Module::query()->orderBy('sort_order')->get();
        $moduleStates = $modules->map(function (Module $module): array {
            $availability = $this->moduleAvailability->availabilityFor($module->module_key);

            return [
                'module_key' => $module->module_key,
                'name_ar' => $module->module_name_ar,
                'name_en' => $module->module_name_en,
                'category' => $module->category,
                'is_core' => in_array($module->module_key, ModuleAvailabilityService::CORE_MODULE_KEYS, true),
                ...$availability,
            ];
        })->values();

        $selectedBusinessModules = $moduleStates
            ->where('is_core', false)
            ->where('is_selected', true)
            ->values();
        $activeBusinessModuleCount = $moduleStates
            ->where('is_core', false)
            ->where('is_operational', true)
            ->count();
        $pending = $selectedBusinessModules
            ->where('is_operational', false)
            ->values();

        // The first-run gate protects only installations with no operational
        // business module. A later optional module may remain pending without
        // taking an already operational organization back behind the gate.
        $hasPendingModuleSetup = $pending->isNotEmpty();
        $requiresSetup = $activeBusinessModuleCount === 0
            && ($selectedBusinessModules->isEmpty() || $hasPendingModuleSetup);
        $nextAction = $hasPendingModuleSetup
            ? ($selectedBusinessModules->isEmpty() ? 'select_modules' : 'complete_organization_setup')
            : ($requiresSetup ? 'select_modules' : null);

        return [
            'setup_required' => $requiresSetup,
            'pending_module_setup' => $hasPendingModuleSetup,
            'selected_module_keys' => $this->moduleAvailability->selectedModuleKeys(),
            'next_action' => $nextAction,
            'pending_module_keys' => $pending->pluck('module_key')->all(),
            'active_module_keys' => $moduleStates
                ->where('is_operational', true)
                ->pluck('module_key')
                ->all(),
            'modules' => $moduleStates->all(),
        ];
    }
}
