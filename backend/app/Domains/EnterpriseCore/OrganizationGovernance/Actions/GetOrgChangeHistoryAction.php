<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;
use Illuminate\Database\Eloquent\Collection;
class GetOrgChangeHistoryAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(?string $entityType, ?string $entityId, int $limit = 50): Collection
    {
        if ($entityType && $entityId) {
            return $this->orgService->getChangeHistory($entityType, $entityId);
        }

        return $this->orgService->getRecentChanges($limit);
    }
}
