<?php

namespace App\Domains\EnterpriseCore\OrgIntegration\Actions;

use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;

class GetJobTitleMappingAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(int|string $id): array
    {
        return $this->service->getJobTitleOrgMapping($id);
    }
}
