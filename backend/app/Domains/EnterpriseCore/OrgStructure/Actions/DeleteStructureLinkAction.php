<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\EnterpriseCore\OrgStructure\Models\StructureLink;
use App\Domains\EnterpriseCore\OrgStructure\Services\OrgStructureService;

class DeleteStructureLinkAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(int $id): void
    {
        $link = StructureLink::findOrFail($id);
        $oldValues = $link->toArray();
        $link->delete();

        $this->orgService->recordChange('link', (string) $id, 'deleted', $oldValues, null);
    }
}
