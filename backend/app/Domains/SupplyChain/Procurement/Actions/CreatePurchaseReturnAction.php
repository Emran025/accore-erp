<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Services\PurchaseService;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
use App\Domains\SupplyChain\PayablesExpenses\Models\ApTransaction;
class CreatePurchaseReturnAction
{
    public function __construct(private readonly PurchaseService $purchaseService) {}

    public function execute(array $data, int $userId): ApTransaction
    {
        $returnId = $this->purchaseService->createReturn(
            $data['invoice_id'],
            $data['items'],
            $data['reason'] ?? null,
            $userId
        );

        return ApTransaction::findOrFail($returnId);
    }
}
