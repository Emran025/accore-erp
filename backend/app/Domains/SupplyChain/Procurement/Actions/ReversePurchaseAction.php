<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Services\PurchaseService;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
class ReversePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(int $id, int $userId): Purchase
    {
        $this->purchaseService->reversePurchase($id, $userId);

        return Purchase::withTrashed()->findOrFail($id);
    }
}
