<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;

class GetJobTitleMappingAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(int|string $id): array
    {
        return $this->service->getJobTitleOrgMapping($id);
    }
}
