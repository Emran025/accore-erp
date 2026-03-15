<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;

class CloseCenterAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(string $type, int|string $id): array
    {
        return $this->service->closeCenter($type, $id);
    }
}
