<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrgStructure\Services\OrgStructureService;
use Illuminate\Http\JsonResponse;

class ResolveScopeContextAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(string $uuid): array
    {
        return $this->orgService->resolveScopeContext($uuid);
    }
}
