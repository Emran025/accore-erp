<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateStructureNodeAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(string $uuid, array $data): StructureNode
    {
        $node = StructureNode::where('node_uuid', $uuid)->firstOrFail();

        if (isset($data['code']) && $data['code'] !== $node->code) {
            if (StructureNode::where('node_type_id', $node->node_type_id)->where('code', $data['code'])->exists()) {
                throw new \Exception('A node with this type and code already exists.', 422);
            }
        }

        $oldValues = $node->toArray();
        $node->update(array_merge($data, ['updated_by' => auth()->id()]));

        $this->orgService->recordChange('node', $uuid, 'updated', $oldValues, $node->fresh()->toArray());

        return $node->fresh('metaType');
    }
}
