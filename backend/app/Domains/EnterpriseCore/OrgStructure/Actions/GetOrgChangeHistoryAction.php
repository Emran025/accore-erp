<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrgStructure\Services\OrgStructureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetOrgChangeHistoryAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(?string $entityType, ?string $entityId, int $limit = 50): array
    {
        if ($entityType && $entityId) {
            return $this->orgService->getChangeHistory($entityType, $entityId)->toArray();
        }

        return $this->orgService->getRecentChanges($limit)->toArray();
    }
}
