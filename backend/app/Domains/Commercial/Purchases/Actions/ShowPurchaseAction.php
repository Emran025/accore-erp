<?php

namespace App\Domains\Commercial\Purchases\Actions;

use App\Domains\Commercial\Purchases\Models\Purchase;

class ShowPurchaseAction
{
    public function execute(int $id): Purchase
    {
        return Purchase::with(['product', 'user', 'supplier'])->findOrFail($id);
    }
}
