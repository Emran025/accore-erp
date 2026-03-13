<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrgStructure\Models\StructureNode;
use Illuminate\Http\JsonResponse;

class ShowStructureNodeAction
{
    public function execute(string $uuid): array
    {
        return StructureNode::with(['metaType', 'outgoingLinks.targetNode.metaType', 'incomingLinks.sourceNode.metaType'])
            ->findOrFail($uuid)
            ->toArray();
    }
}
