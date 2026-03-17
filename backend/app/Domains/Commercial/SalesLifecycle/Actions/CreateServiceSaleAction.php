<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Services\ServiceSaleService;

/**
 * Application use case: create a service sale invoice (cash or credit).
 * Delegates all business logic to ServiceSaleService.
 */
class CreateServiceSaleAction
{
    public function __construct(
        private readonly ServiceSaleService $serviceSaleService,
    ) {}

    public function execute(array $data): array
    {
        $invoiceId = $this->serviceSaleService->createServiceSale($data);

        return ['id' => $invoiceId];
    }
}
