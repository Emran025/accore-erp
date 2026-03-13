<?php

namespace App\Domains\EnterpriseCore\OrgIntegration\Actions;

use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;

class CloseCenterAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(string $type, int|string $id): array
    {
        return $this->service->closeCenter($type, $id);
    }
}
