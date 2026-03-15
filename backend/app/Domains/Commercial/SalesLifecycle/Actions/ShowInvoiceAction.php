<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\Invoice;

class ShowInvoiceAction
{
    public function execute(int $id): Invoice
    {
        $invoice = Invoice::with(['items.product', 'items.returns', 'user', 'customer', 'zatcaEinvoice', 'taxLines'])
            ->withCount('items')
            ->findOrFail($id);

        return $invoice;
    }
}
