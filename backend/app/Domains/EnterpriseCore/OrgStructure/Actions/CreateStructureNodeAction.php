<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrgStructure\Models\StructureNode;
use App\Domains\EnterpriseCore\OrgStructure\Services\OrgStructureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CreateStructureNodeAction
{
    public function __construct(
        private readonly OrgStructureService $orgService
    ) {}

    public function execute(array $data): array
    {
        if (StructureNode::where('node_type_id', $data['node_type_id'])->where('code', $data['code'])->exists()) {
            throw new \Exception('A node with this type and code already exists.', 422);
        }

        return $this->orgService->createNodeWithLink($data, $data['link'] ?? null);
    }
}
