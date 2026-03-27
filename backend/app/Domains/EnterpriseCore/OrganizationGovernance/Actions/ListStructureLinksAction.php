<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgStructureService;
use Illuminate\Database\Eloquent\Collection;
class ListStructureLinksAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(array $filters = []): Collection
    {
        return $this->orgService->getAllLinks($filters);
    }
}
