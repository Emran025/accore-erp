<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\EnterpriseCore\OrgStructure\Models\StructureNode;
use App\Domains\EnterpriseCore\OrgStructure\Services\OrgStructureService;

class DeleteStructureNodeAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(string $uuid): void
    {
        $node = StructureNode::findOrFail($uuid);
        $check = $this->orgService->canDeleteNode($uuid);

        if (!$check['allowed']) {
            throw new \Exception($check['reason'], 422);
        }

        $oldValues = $node->toArray();
        $node->delete();

        $this->orgService->recordChange('node', $uuid, 'deleted', $oldValues, null);
    }
}
