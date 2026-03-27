<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Services\PurchaseService;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
class CreatePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(array $data, int $userId): Purchase
    {
        return $this->purchaseService->createPurchase($data, $userId);
    }
}
