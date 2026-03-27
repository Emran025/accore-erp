<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;

class CreateStructureLinkAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(string $sourceNodeUuid, string $targetNodeUuid, array $data): StructureLink
    {
        $link = $this->orgService->createLink(
            $sourceNodeUuid,
            $targetNodeUuid,
            $data
        );
        
        return $link->load(['sourceNode', 'targetNode']);
    }
}
