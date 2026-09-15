<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;

class UpdateNodeFacetsAction
{
    public function __construct(
        private readonly OrgIntegrationService $integrationService
    ) {}

    /**
     * @param string $nodeUuid
     * @param array<string, mixed> $data
     * @return StructureNode
     */
    public function execute(string $nodeUuid, array $data): StructureNode
    {
        $node = StructureNode::where('node_uuid', $nodeUuid)->firstOrFail();
        $facets = array_values(array_unique($data['facets'] ?? []));

        $node->update([
            'facets_json' => $facets,
        ]);

        try {
            $this->integrationService->syncNodeToTable($nodeUuid);
        } catch (\Throwable) {
            // Safe non-blocking sync
        }

        return $node->fresh();
    }
}
