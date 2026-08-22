<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;
use Illuminate\Support\Facades\DB;

class UpdateStructureNodeAction
{
    public function __construct(
        private readonly OrgStructureService $orgService,
        private readonly OrgIntegrationService $orgIntegration,
    ) {}

    public function execute(string $uuid, array $data): StructureNode
    {
        return DB::transaction(function () use ($uuid, $data) {
            $node = StructureNode::where('node_uuid', $uuid)->lockForUpdate()->firstOrFail();

            if (isset($data['code']) && $data['code'] !== $node->code) {
                if (StructureNode::where('node_type_id', $node->node_type_id)->where('code', $data['code'])->where('node_uuid', '!=', $uuid)->exists()) {
                    throw new \Exception('A node with this type and code already exists.', 422);
                }
            }

            $oldValues = $node->toArray();
            $mergedAttributes = array_merge($node->attributes_json ?? [], $data['attributes'] ?? []);
            $normalizedAttributes = $this->orgService->normalizeAndValidateNodeAttributes($node->node_type_id, $mergedAttributes);
            $node->update([
                'code' => $data['code'] ?? $node->code,
                'attributes_json' => $normalizedAttributes,
                'status' => $data['status'] ?? $node->status,
                'valid_from' => array_key_exists('valid_from', $data) ? $data['valid_from'] : $node->valid_from,
                'valid_to' => array_key_exists('valid_to', $data) ? $data['valid_to'] : $node->valid_to,
                'updated_by' => auth()->id(),
            ]);
            $node->load('outgoingLinks.targetNode', 'outgoingLinks.topologyRule');
            $this->orgService->assertActiveParentConstraints($node, $node->outgoingLinks->filter->isActive());

            if ($node->node_type_id === 'COST_CENTER') {
                $this->orgIntegration->syncOrgNodeToCostCenter($node);
            }
            if ($node->node_type_id === 'PROFIT_CENTER') {
                $this->orgIntegration->syncOrgNodeToProfitCenter($node);
            }

            $this->orgService->recordChange('node', $uuid, 'updated', $oldValues, $node->fresh()->toArray());

            return $node->fresh('metaType');
        });
    }
}
