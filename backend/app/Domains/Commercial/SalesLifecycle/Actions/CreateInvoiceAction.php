<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Services\SalesService;

class CreateInvoiceAction
{
    public function __construct(
        private readonly SalesService $salesService,
    ) {}

    public function execute(array $data): array
    {
        $invoiceId = $this->salesService->createInvoice($data);
        
        return ['id' => $invoiceId];
    }
}
