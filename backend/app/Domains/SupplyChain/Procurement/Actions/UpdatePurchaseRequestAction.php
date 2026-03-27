<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Models\PurchaseRequest;

class UpdatePurchaseRequestAction
{
    public function execute(array $data, ?int $id = null): PurchaseRequest
    {
        $id = $id ?? $data['id'];
        $purchaseRequest = PurchaseRequest::findOrFail($id);
        $purchaseRequest->update(['status' => $data['status']]);
        
        return $purchaseRequest;
    }
}
