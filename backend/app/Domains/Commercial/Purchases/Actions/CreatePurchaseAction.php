<?php

namespace App\Domains\Commercial\Purchases\Actions;

use App\Domains\Commercial\Purchases\Services\PurchaseService;

class CreatePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(array $data, int $userId): array
    {
        $purchase = $this->purchaseService->createPurchase($data, $userId);

        return $purchase->toArray();
    }
}
