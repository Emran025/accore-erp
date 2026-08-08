<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\ViewInvoiceSummary;
use Illuminate\Pagination\LengthAwarePaginator;

class ListInvoicesAction
{
    /**
     * List invoices using the v_invoice_summary view.
     *
     * Pre-joins customer name/phone, created-by user name, sales rep, item count,
     * GL totals, and tax totals without N+1 query execution.
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        $requested   = (int) ($filters['limit'] ?? $filters['per_page'] ?? 20);
        $perPage     = min(2000, max(1, $requested));
        $paymentType = $filters['payment_type'] ?? null;
        $customerId  = $filters['customer_id'] ?? null;

        $query = ViewInvoiceSummary::active();

        if ($paymentType) {
            $query->where('payment_type', $paymentType);
        }

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        return $query->latest()->paginate($perPage);
    }
}

