<?php

namespace App\Domains\EnterpriseCore\OrgIntegration\Actions;

use App\Domains\Finance\CostProfitCenters\Models\CostCenter;
use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;

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
