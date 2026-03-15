<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CreateStructureLinkAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(string $sourceNodeUuid, string $targetNodeUuid, array $data): array
    {
        $link = $this->orgService->createLink(
            $sourceNodeUuid,
            $targetNodeUuid,
            $data
        );
        
        return $link->load(['sourceNode', 'targetNode'])->toArray();
    }
}
