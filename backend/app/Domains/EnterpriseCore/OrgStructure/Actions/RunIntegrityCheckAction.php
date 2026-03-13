<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\EnterpriseCore\OrgStructure\Services\OrgStructureService;

class RunIntegrityCheckAction
{
    public function __construct(private readonly OrgStructureService $orgService) {}

    public function execute(): array
    {
        return $this->orgService->runIntegrityCheck();
    }
}
