<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Services\SalesService;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
class CreateInvoiceAction
{
    public function __construct(
        private readonly SalesService $salesService,
    ) {}

    public function execute(array $data): Invoice
    {
        $invoiceId = $this->salesService->createInvoice($data);
        
        return Invoice::findOrFail($invoiceId);
    }
}
