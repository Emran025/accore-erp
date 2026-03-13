<?php

namespace App\Domains\Commercial\Purchases\Actions;

use App\Domains\Commercial\Purchases\Services\PurchaseService;

class ApprovePurchaseAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(int $purchaseId, int $userId): bool
    {
        return $this->purchaseService->approvePurchase($purchaseId, $userId);
    }
}
