<?php

namespace App\Domains\Commercial\Sales\Actions;

use App\Domains\Commercial\Sales\Models\SalesReturn;

class ShowSalesReturnAction
{
    public function execute(int $id): SalesReturn
    {
        $return = SalesReturn::with(['invoice.customer', 'invoice.taxLines', 'user', 'items.product', 'taxLines'])
            ->withCount('items')
            ->findOrFail($id);

        return $return;
    }
}
