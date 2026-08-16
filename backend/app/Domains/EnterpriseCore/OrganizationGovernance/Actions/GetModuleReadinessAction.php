<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleReadinessService;

class GetModuleReadinessAction
{
    public function __construct(private readonly ModuleReadinessService $service)
    {
    }

    public function execute(?int $userId = null): array
    {
        return $this->service->evaluate($userId);
    }
}
