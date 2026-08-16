<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Exceptions\BusinessLogicException;

/**
 * Activates selected modules only after their organizational prerequisites are
 * true at the time of activation. Selection remains intent; activation is the
 * audited operational decision.
 */
final class ModuleActivationService
{
    /** @var list<string> */
    private const OPERATING_CONTEXT_MODULES = [
        'sales',
        'purchases',
        'deferred_sales',
        'returns',
        'revenues',
    ];

    public function __construct(
        private readonly ModuleAvailabilityService $moduleAvailability,
        private readonly OperatingContextService $operatingContext,
    ) {}

    public function activate(string $moduleKey, ?int $userId): Module
    {
        $module = Module::query()->where('module_key', $moduleKey)->firstOrFail();

        if (in_array($moduleKey, ModuleAvailabilityService::CORE_MODULE_KEYS, true)) {
            return $module;
        }

        if (! in_array($moduleKey, $this->moduleAvailability->selectedModuleKeys(), true)) {
            throw new BusinessLogicException('The module must be selected before it can be activated.', 422);
        }

        if (! $this->hasActiveOrganizationalStructure()) {
            throw new BusinessLogicException('Complete an active organizational structure before activating this module.', 422);
        }

        if (in_array($moduleKey, self::OPERATING_CONTEXT_MODULES, true)) {
            $readiness = $this->operatingContext->readiness($userId);
            if (! $readiness['ready']) {
                throw new BusinessLogicException('Complete the operating context before activating this operational module.', 422);
            }
        }

        $module->update(['is_active' => true]);

        return $module->fresh();
    }

    /**
     * @return array{activated: list<string>, pending: array<string, string>}
     */
    public function activateReadySelected(?int $userId): array
    {
        $activated = [];
        $pending = [];

        foreach ($this->moduleAvailability->selectedModuleKeys() as $moduleKey) {
            try {
                $module = $this->activate($moduleKey, $userId);
                if ($module->is_active) {
                    $activated[] = $moduleKey;
                }
            } catch (BusinessLogicException $exception) {
                $pending[$moduleKey] = $exception->getMessage();
            }
        }

        return compact('activated', 'pending');
    }

    private function hasActiveOrganizationalStructure(): bool
    {
        return StructureNode::query()->where('status', 'active')->exists();
    }
}
