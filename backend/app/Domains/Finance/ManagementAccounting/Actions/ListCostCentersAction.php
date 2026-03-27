<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
class ListCostCentersAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $perPage = min(100, max(1, (int)($filters['per_page'] ?? $filters['limit'] ?? 20)));

        $query = CostCenter::with(['parent', 'account', 'manager', 'createdBy', 'children']);

        // Search
        if ($search = ($filters['search'] ?? null)) {
            $query->where(function (Builder $q) use ($search) {
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

        $paginator = $query->orderBy('code', 'asc')->paginate($perPage);

        // Enrichment logic preserved for data consistency within the paginator
        $paginator->getCollection()->each(function ($center) {
            $center->actual_cost = GeneralLedger::where('cost_center_id', $center->id)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
            $center->budget_utilization = $center->budget > 0
                ? round(($center->actual_cost / $center->budget) * 100, 2)
                : 0;
        });

        return $paginator;
    }
}
