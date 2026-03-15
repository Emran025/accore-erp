<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Models\Purchase;

class ListPurchasesAction
{
    public function execute(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $search = $filters['search'] ?? '';

        $query = Purchase::with(['product', 'user', 'supplier']);

        if ($search) {
            $query->whereHas('product', fn($q) => $q->where('name', 'like', "%$search%"));
        }

        $total = $query->count();
        $purchases = $query->orderBy('purchase_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'data' => $purchases,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
        ];
    }
}
