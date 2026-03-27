<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Models\PurchaseRequest;
use Illuminate\Database\Eloquent\Collection;

class ListPurchaseRequestsAction
{
    public function execute(): Collection
    {
        return PurchaseRequest::with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
