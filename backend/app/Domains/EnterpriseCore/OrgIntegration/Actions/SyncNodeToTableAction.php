<?php

namespace App\Domains\EnterpriseCore\OrgIntegration\Actions;

use App\Domains\EnterpriseCore\OrgStructure\Models\StructureNode;
use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;

class SyncNodeToTableAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(string $uuid): array
    {
        $node = StructureNode::findOrFail($uuid);

        if ($node->node_type_id === 'COST_CENTER') {
            $center = $this->service->syncOrgNodeToCostCenter($node);
            return [
                'type'           => 'cost_center',
                'cost_center'    => current($center->toArray()) ?: reset($center),
                'structure_node' => current($node->fresh()->toArray()) ?: reset($node),
            ];
        }

        if ($node->node_type_id === 'PROFIT_CENTER') {
            $center = $this->service->syncOrgNodeToProfitCenter($node);
            return [
                'type'           => 'profit_center',
                'profit_center'  => current($center->toArray()) ?: reset($center),
                'structure_node' => current($node->fresh()->toArray()) ?: reset($node),
            ];
        }

        throw new \Exception('نوع العقدة غير مدعوم للمزامنة. مطلوب COST_CENTER أو PROFIT_CENTER');
    }
}
