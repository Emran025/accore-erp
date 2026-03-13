<?php

namespace App\Domains\Commercial\Purchases\Actions;

use App\Domains\Commercial\Purchases\Services\PurchaseService;

class ReversePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(int $id, int $userId): void
    {
        $this->purchaseService->reversePurchase($id, $userId);
    }
}
