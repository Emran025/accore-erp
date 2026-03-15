<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;

class SyncCostCenterAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(int|string $id): array
    {
        $center = CostCenter::findOrFail($id);
        $node   = $this->service->syncCostCenterToOrgChart($center);

        return [
            'cost_center'    => current($center->fresh()->toArray()) ?: reset($center),
            'structure_node' => current($node->toArray()) ?: reset($node),
        ];
    }
}
