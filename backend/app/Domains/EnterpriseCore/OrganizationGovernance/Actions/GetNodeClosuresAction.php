<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgNodeClosureService;

class GetNodeClosuresAction
{
    public function __construct(
        private readonly OrgNodeClosureService $closureService
    ) {}

    /**
     * @param string $nodeUuid
     * @param string $planeType
     * @return array<string, mixed>
     */
    public function execute(string $nodeUuid, string $planeType = 'OPERATIONAL_HIERARCHY'): array
    {
        $ancestorUuids = $this->closureService->getAncestors($nodeUuid, $planeType);
        $descendantUuids = $this->closureService->getDescendants($nodeUuid, $planeType);

        $ancestors = StructureNode::whereIn('node_uuid', $ancestorUuids)->get();
        $descendants = StructureNode::whereIn('node_uuid', $descendantUuids)->get();

        return [
            'node_uuid'   => $nodeUuid,
            'plane_type'  => $planeType,
            'ancestors'   => $ancestors,
            'descendants' => $descendants,
        ];
    }
}
