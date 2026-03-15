<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
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
