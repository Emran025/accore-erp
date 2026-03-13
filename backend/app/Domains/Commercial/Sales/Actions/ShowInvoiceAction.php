<?php

namespace App\Domains\Commercial\Sales\Actions;

use App\Domains\Commercial\Sales\Models\Invoice;

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
