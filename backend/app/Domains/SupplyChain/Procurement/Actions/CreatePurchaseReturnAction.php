<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Services\PurchaseService;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
class CreatePurchaseReturnAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(array $data, int $userId): Purchase
    {
        $returnId = $this->purchaseService->createReturn(
            $data['invoice_id'],
            $data['items'],
            $data['reason'] ?? null,
            $userId
        );

        return Purchase::findOrFail($returnId);
    }
}
