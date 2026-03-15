<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Services\PurchaseService;

class CreatePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(array $data, int $userId): array
    {
        $purchase = $this->purchaseService->createPurchase($data, $userId);

        return $purchase->toArray();
    }
}
