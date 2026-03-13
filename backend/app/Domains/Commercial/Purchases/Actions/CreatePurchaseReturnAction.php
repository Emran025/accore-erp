<?php

namespace App\Domains\Commercial\Purchases\Actions;

use App\Domains\Commercial\Purchases\Services\PurchaseService;

class CreatePurchaseReturnAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(array $data, int $userId): int
    {
        return $this->purchaseService->createReturn(
            $data['invoice_id'],
            $data['items'],
            $data['reason'] ?? null,
            $userId
        );
    }
}
