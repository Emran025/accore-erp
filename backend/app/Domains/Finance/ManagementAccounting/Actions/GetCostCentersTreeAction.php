<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\CostCenter;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class GetCostCentersTreeAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $centers = CostCenter::with(['children', 'account'])
                    ->where('is_active', true)
                    ->whereNull('parent_id')
                    ->get();

        return $this->buildTree($centers);
    }

    private function buildTree($nodes): array
    {
        return $nodes->map(function ($node) {
            $item = [
                'id'       => $node->id,
                'code'     => $node->code,
                'name'     => $node->name,
                'name_en'  => $node->name_en,
                'type'     => $node->type,
                'is_active'=> $node->is_active,
                'account_name' => $node->account->account_name ?? null,
                'budget'       => $node->budget,
                'children' => [],
            ];

            if ($node->children->isNotEmpty()) {
                $loaded = CostCenter::with(['children', 'account'])->where('parent_id', $node->id)->get();
                $item['children'] = $this->buildTree($loaded);
            }

            return $item;
        })->toArray();
    }
}
