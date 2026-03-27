<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;

class UpdateStructureLinkAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(int $id, array $data): StructureLink
    {
        return $this->orgService->updateLink($id, $data);
    }
}
