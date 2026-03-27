<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Services\PurchaseService;
use App\Domains\SupplyChain\Procurement\Models\Purchase;

class ApprovePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(int $purchaseId, int $userId): Purchase
    {
        $this->purchaseService->approvePurchase($purchaseId, $userId);

        return Purchase::findOrFail($purchaseId);
    }
}
