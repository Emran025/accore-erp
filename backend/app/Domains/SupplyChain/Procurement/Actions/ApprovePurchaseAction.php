<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Services\PurchaseService;

class ApprovePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(int $purchaseId, int $userId): bool
    {
        return $this->purchaseService->approvePurchase($purchaseId, $userId);
    }
}
