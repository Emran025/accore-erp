<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Models\PurchaseRequest;

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
