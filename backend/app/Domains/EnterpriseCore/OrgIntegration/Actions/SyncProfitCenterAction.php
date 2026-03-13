<?php

namespace App\Domains\EnterpriseCore\OrgIntegration\Actions;

use App\Domains\Finance\CostProfitCenters\Models\ProfitCenter;
use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;

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
