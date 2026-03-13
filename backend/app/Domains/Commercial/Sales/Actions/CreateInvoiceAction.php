<?php

namespace App\Domains\Commercial\Sales\Actions;

use App\Domains\Commercial\Sales\Services\SalesService;

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
