<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class GetProfitCentersTreeAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $centers = ProfitCenter::with(['children', 'revenueAccount', 'expenseAccount'])
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
                'revenue_account_name' => $node->revenueAccount->account_name ?? null,
                'expense_account_name' => $node->expenseAccount->account_name ?? null,
                'revenue_target'       => $node->revenue_target,
                'expense_budget'       => $node->expense_budget,
                'children' => [],
            ];

            if ($node->children->isNotEmpty()) {
                $loaded = ProfitCenter::with(['children', 'revenueAccount', 'expenseAccount'])->where('parent_id', $node->id)->get();
                $item['children'] = $this->buildTree($loaded);
            }

            return $item;
        })->toArray();
    }
}
