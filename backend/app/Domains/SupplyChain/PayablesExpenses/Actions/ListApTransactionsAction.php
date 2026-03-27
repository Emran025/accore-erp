<?php

namespace App\Domains\SupplyChain\PayablesExpenses\Actions;

use App\Domains\SupplyChain\PayablesExpenses\Models\ApTransaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListApTransactionsAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? $filters['limit'] ?? 15)));

        $query = ApTransaction::with(['supplier', 'createdBy'])
            ->when($filters['supplier_id'] ?? null, fn($q, $id) => $q->where('supplier_id', $id))
            ->when($filters['type'] ?? null, fn($q, $type) => $q->where('type', $type))
            ->orderByDesc('transaction_date');

        return $query->paginate($perPage);
    }
}
