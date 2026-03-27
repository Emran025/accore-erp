<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;

class CreateStructureNodeAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(array $data): StructureNode
    {
        if (StructureNode::where('node_type_id', $data['node_type_id'])->where('code', $data['code'])->exists()) {
            throw new \Exception('A node with this type and code already exists.', 422);
        }

        $result = $this->orgService->createNodeWithLink($data, $data['link'] ?? null);
        return $result['node'];
    }
}
