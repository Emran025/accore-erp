<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;

class BulkSyncOrgAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(array $targets): array
    {
        return $this->service->bulkSync($targets);
    }
}
