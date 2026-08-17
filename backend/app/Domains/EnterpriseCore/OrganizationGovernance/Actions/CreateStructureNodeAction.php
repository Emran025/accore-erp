<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;

class CreateStructureNodeAction
{
    public function __construct(
        private readonly OrgStructureService $orgService,
        private readonly OrgIntegrationService $orgIntegration,
    ) {
    }

    public function execute(array $data): StructureNode
    {
        if (StructureNode::where('node_type_id', $data['node_type_id'])->where('code', $data['code'])->exists()) {
            throw new \Exception('A node with this type and code already exists.', 422);
        }

        $result = $this->orgService->createNodeWithLink($data, $data['link'] ?? null);
        $node = $result['node'];

        // The configuration workflow owns the organization first. When the
        // selected unit is a financial dimension, immediately create and link
        // its finance record so readiness never accepts an orphaned unit.
        if ($node->node_type_id === 'COST_CENTER') {
            $this->orgIntegration->syncOrgNodeToCostCenter($node);
        }
        if ($node->node_type_id === 'PROFIT_CENTER') {
            $this->orgIntegration->syncOrgNodeToProfitCenter($node);
        }

        return $node->fresh();
    }
}
