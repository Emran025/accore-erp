<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;

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
