<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\InventoryCount;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListPeriodicInventoryAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? $filters['limit'] ?? 20)));
        $periodId = $filters['period_id'] ?? null;

        $query = InventoryCount::with(['product', 'fiscalPeriod', 'countedBy']);

        if ($periodId) {
            $query->where('fiscal_period_id', $periodId);
        }

        return $query->orderBy('count_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }
}
