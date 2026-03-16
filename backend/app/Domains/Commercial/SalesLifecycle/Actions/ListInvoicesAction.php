<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use Illuminate\Pagination\LengthAwarePaginator;
class ListInvoicesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $paymentType = $filters['payment_type'] ?? null;
        $customerId = $filters['customer_id'] ?? null;

        $query = Invoice::with(['user', 'customer'])->withCount('items');

        if ($paymentType) {
            $query->where('payment_type', $paymentType);
        }
        
        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
