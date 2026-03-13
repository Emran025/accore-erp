<?php

namespace App\Domains\Commercial\Sales\Actions;

use App\Domains\Commercial\Sales\Models\SalesReturn;

class ListSalesReturnsAction
{
    public function execute(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $invoiceId = $filters['invoice_id'] ?? null;

        $query = SalesReturn::with(['invoice', 'user', 'items.product'])
            ->withCount('items');

        if ($invoiceId) {
            $query->where('invoice_id', $invoiceId);
        }

        $total = $query->count();
        $returns = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'data' => $returns,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
        ];
    }
}
