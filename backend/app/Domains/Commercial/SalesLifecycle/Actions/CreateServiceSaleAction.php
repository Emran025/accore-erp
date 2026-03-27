<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Services\ServiceSaleService;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
/**
 * Application use case: create a service sale invoice (cash or credit).
 * Delegates all business logic to ServiceSaleService.
 */
class CreateServiceSaleAction
{
    public function __construct(
        private readonly ServiceSaleService $serviceSaleService,
    ) {}

    public function execute(array $data): Invoice
    {
        $invoiceId = $this->serviceSaleService->createServiceSale($data);
 
        return Invoice::findOrFail($invoiceId);
    }
}
