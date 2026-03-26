<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\Invoice;

class ShowServiceInvoiceAction
{
    /**
     * Show single service invoice details.
     */
    public function execute(int $id): Invoice
    {
        return Invoice::with(['items.product', 'items.returns', 'user', 'customer', 'taxLines'])
            ->withCount('items')
            ->where('invoice_type', 'service')
            ->findOrFail($id);
    }
}
