<?php

namespace App\Domains\Commercial\Purchases\Actions;

use App\Domains\Commercial\Purchases\Models\PurchaseRequest;

class ListPurchaseRequestsAction
{
    public function execute(): array
    {
        return PurchaseRequest::with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }
}
