<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class ListProfitCentersAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? $filters['limit'] ?? 20)));

        $query = ProfitCenter::with(['parent', 'revenueAccount', 'expenseAccount', 'manager', 'createdBy', 'children']);

        if ($search = ($filters['search'] ?? null)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($type = ($filters['type'] ?? null)) {
            $query->where('type', $type);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['parent_id'])) {
            $parentId = $filters['parent_id'];
            $query->where('parent_id', $parentId === 'null' ? null : $parentId);
        }

        $total = $query->count();
        $items = $query->orderBy('code', 'asc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        $items->each(function ($center) {
            $center->recorder_name       = $center->createdBy->name ?? null;
            $center->parent_name         = $center->parent->name ?? null;
            $center->revenue_account_name = $center->revenueAccount->account_name ?? null;
            $center->expense_account_name = $center->expenseAccount->account_name ?? null;
            $center->manager_name        = $center->manager->name ?? null;
            $center->children_count      = $center->children->count();

            // Revenue & expense totals from GL
            $center->actual_revenue = GeneralLedger::where('profit_center_id', $center->id)
                ->where('entry_type', 'CREDIT')
                ->sum('amount');
            $center->actual_expense = GeneralLedger::where('profit_center_id', $center->id)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
            $center->net_profit = $center->actual_revenue - $center->actual_expense;
            $center->revenue_achievement = $center->revenue_target > 0
                ? round(($center->actual_revenue / $center->revenue_target) * 100, 2)
                : 0;
        });

        return [
            'items' => $items->toArray(),
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ];
    }
}
