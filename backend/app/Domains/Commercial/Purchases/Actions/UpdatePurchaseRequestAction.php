<?php

namespace App\Domains\Commercial\Purchases\Actions;

use App\Domains\Commercial\Purchases\Models\PurchaseRequest;

class UpdatePurchaseRequestAction
{
    public function execute(array $data): void
    {
        $purchaseRequest = PurchaseRequest::findOrFail($data['id']);
        $purchaseRequest->update(['status' => $data['status']]);
    }
}
