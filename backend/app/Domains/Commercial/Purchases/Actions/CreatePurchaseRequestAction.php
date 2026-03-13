<?php

namespace App\Domains\Commercial\Purchases\Actions;

use App\Domains\Commercial\Purchases\Models\PurchaseRequest;

class CreatePurchaseRequestAction
{
    public function execute(array $data, int $userId): array
    {
        $purchaseRequest = PurchaseRequest::create([
            'product_id' => $data['product_id'] ?? null,
            'product_name' => $data['product_name'] ?? null,
            'quantity' => $data['quantity'],
            'notes' => $data['notes'] ?? null,
            'user_id' => $userId,
            'status' => 'pending',
        ]);

        return ['id' => $purchaseRequest->id];
    }
}
