<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;

class BulkSyncJobTitlesAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(): array
    {
        return $this->service->syncAllJobTitles();
    }
}
