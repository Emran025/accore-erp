<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrgStructure\Models\StructureNode;
use App\Domains\EnterpriseCore\OrgStructure\Services\OrgStructureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulkUpdateNodeStatusAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(array $nodeUuids, string $status): array
    {
        $nodes = StructureNode::whereIn('node_uuid', $nodeUuids)->get();
        $updated = 0;

        foreach ($nodes as $node) {
            $oldValues = $node->toArray();
            $node->update(['status' => $status]);
            $this->orgService->recordChange('node', $node->node_uuid, 'bulk_status_update', $oldValues, $node->fresh()->toArray());
            $updated++;
        }

        return ['updated' => $updated];
    }
}
