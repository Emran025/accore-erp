<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\Procurement\Models\Purchase;

class ShowPurchaseAction
{
    public function execute(int $id): Purchase
    {
        return Purchase::with(['product', 'user', 'supplier'])->findOrFail($id);
    }
}
