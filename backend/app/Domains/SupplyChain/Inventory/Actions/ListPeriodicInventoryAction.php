<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\InventoryCount;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;


class ListPeriodicInventoryAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('products', 'view');

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $periodId = $filters['period_id'] ?? null;

        $query = InventoryCount::with(['product', 'fiscalPeriod', 'countedBy']);

        if ($periodId) {
            $query->where('fiscal_period_id', $periodId);
        }

        $total = $query->count();
        $counts = $query->orderBy('count_date', 'desc')
            ->orderBy('id', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'data' => $counts,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage
        ];
    }
}
