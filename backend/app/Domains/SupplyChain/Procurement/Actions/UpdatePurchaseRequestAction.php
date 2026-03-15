<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Models\PurchaseRequest;

class UpdatePurchaseRequestAction
{
    public function execute(array $data): void
    {
        $purchaseRequest = PurchaseRequest::findOrFail($data['id']);
        $purchaseRequest->update(['status' => $data['status']]);
    }
}
