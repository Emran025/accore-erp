<?php

namespace App\Domains\Commercial\RevenueReceivables\Actions;

use App\Domains\Commercial\RevenueReceivables\Models\ArTransaction;

class ListArTransactionsAction
{
    public function execute(array $filters): array
    {
        $query = ArTransaction::with(['customer', 'createdBy'])
            ->when($filters['customer_id'] ?? null, fn($q, $id) => $q->where('customer_id', $id))
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
