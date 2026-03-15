<?php

namespace App\Domains\SupplyChain\PayablesExpenses\Actions;

use App\Domains\SupplyChain\PayablesExpenses\Models\ApTransaction;

class ListApTransactionsAction
{
    public function execute(array $filters): array
    {
        $query = ApTransaction::with(['supplier', 'createdBy'])
            ->when($filters['supplier_id'] ?? null, fn($q, $id) => $q->where('supplier_id', $id))
            ->when($filters['type'] ?? null, fn($q, $type) => $q->where('type', $type))
            ->orderByDesc('transaction_date');

        $perPage = $filters['per_page'] ?? 15;
        $transactions = $query->paginate($perPage);

        return [
            'data' => $transactions->items(),
            'total' => $transactions->total(),
            'current_page' => $transactions->currentPage(),
            'per_page' => $transactions->perPage(),
        ];
    }
}
