<?php

namespace App\Domains\Commercial\Sales\Actions;

use App\Domains\Commercial\Sales\Services\SalesService;
use App\Domains\Commercial\Sales\Models\Invoice;

class DeleteInvoiceAction
{
    public function __construct(
        private readonly SalesService $salesService,
    ) {}

    public function execute(int $id): array
    {
        $invoice = Invoice::findOrFail($id);
        $oldValues = $invoice->toArray();
        
        $this->salesService->deleteInvoice($id);
        
        return $oldValues;
    }
}
