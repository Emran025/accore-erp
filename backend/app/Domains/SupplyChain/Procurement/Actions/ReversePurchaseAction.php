<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Services\PurchaseService;

class ReversePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(int $id, int $userId): void
    {
        $this->purchaseService->reversePurchase($id, $userId);
    }
}
