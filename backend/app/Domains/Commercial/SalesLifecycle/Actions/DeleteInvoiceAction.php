<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Services\SalesService;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;

class DeleteInvoiceAction
{
    public function __construct(
        private readonly SalesService $salesService,
    ) {}

    public function execute(int $id): Invoice
    {
        $this->salesService->deleteInvoice($id);
        
        return Invoice::withTrashed()->findOrFail($id);
    }
}
