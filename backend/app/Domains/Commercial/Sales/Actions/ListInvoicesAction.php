<?php

namespace App\Domains\Commercial\Sales\Actions;

use App\Domains\Commercial\Sales\Models\Invoice;

class ListInvoicesAction
{
    public function execute(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
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

        $total = $query->count();
        $invoices = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'data' => $invoices,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
        ];
    }
}
