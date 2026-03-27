<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Pagination\LengthAwarePaginator;
class ListProfitCentersAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

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

        $paginator = $query->orderBy('code', 'asc')->paginate($perPage);

        $paginator->getCollection()->each(function ($center) {
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

        return $paginator;
    }
}
