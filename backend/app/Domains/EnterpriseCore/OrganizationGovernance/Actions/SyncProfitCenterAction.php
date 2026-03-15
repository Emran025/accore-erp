<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;

class SyncProfitCenterAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(int|string $id): array
    {
        $center = ProfitCenter::findOrFail($id);
        $node   = $this->service->syncProfitCenterToOrgChart($center);

        return [
            'profit_center'  => current($center->fresh()->toArray()) ?: reset($center),
            'structure_node' => current($node->toArray()) ?: reset($node),
        ];
    }
}
