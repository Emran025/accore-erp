<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;

class RunIntegrityCheckAction
{
    public function __construct(private readonly OrgStructureService $orgService) {}

    public function execute(): array
    {
        return $this->orgService->runIntegrityCheck();
    }
}
