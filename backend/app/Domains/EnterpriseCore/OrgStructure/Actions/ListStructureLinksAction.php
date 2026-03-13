<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrgStructure\Services\OrgStructureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListStructureLinksAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(array $filters = []): array
    {
        return $this->orgService->getAllLinks($filters)->toArray();
    }
}
