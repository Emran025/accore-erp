<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateStructureLinkAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(int $id, array $data): array
    {
        $link = $this->orgService->updateLink($id, $data);
        return $link->toArray();
    }
}
