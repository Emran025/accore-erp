<?php

namespace App\Domains\EnterpriseCore\OrgIntegration\Actions;

use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;

class BulkSyncProfitCentersAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(): array
    {
        return $this->service->syncAllProfitCentersToOrgChart();
    }
}
