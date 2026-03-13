<?php
namespace App\Domains\Finance\CostProfitCenters\Actions;

use App\Domains\Finance\CostProfitCenters\Models\CostCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListCostCentersAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? $filters['limit'] ?? 20)));

        $query = CostCenter::with(['parent', 'account', 'manager', 'createdBy', 'children']);

        // Search
        if ($search = ($filters['search'] ?? null)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($type = ($filters['type'] ?? null)) {
            $query->where('type', $type);
        }

        // Filter by status
        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by parent
        if (isset($filters['parent_id'])) {
            $parentId = $filters['parent_id'];
            $query->where('parent_id', $parentId === 'null' ? null : $parentId);
        }

        $total = $query->count();
        $items = $query->orderBy('code', 'asc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Enrich with actual costs from GL
        $items->each(function ($center) {
            $center->recorder_name = $center->createdBy->name ?? null;
            $center->parent_name   = $center->parent->name ?? null;
            $center->account_name  = $center->account->account_name ?? null;
            $center->manager_name  = $center->manager->name ?? null;
            $center->children_count = $center->children->count();

            // Sum actual costs from GL
            $center->actual_cost = GeneralLedger::where('cost_center_id', $center->id)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
            $center->budget_utilization = $center->budget > 0
                ? round(($center->actual_cost / $center->budget) * 100, 2)
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
