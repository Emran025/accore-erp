<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\SalesReturn;
use Illuminate\Pagination\LengthAwarePaginator;
class ListSalesReturnsAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $invoiceId = $filters['invoice_id'] ?? null;
        $invoiceType = $filters['invoice_type'] ?? null;

        $query = SalesReturn::with(['invoice', 'user', 'items.product'])
            ->withCount('items');

        if ($invoiceType) {
            $query->whereHas('invoice', function ($q) use ($invoiceType) {
                $q->where('invoice_type', $invoiceType);
            });
        }

        if ($invoiceId) {
            $query->where('invoice_id', $invoiceId);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
