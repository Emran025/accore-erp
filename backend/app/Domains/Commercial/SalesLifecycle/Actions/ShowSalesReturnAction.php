<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\SalesReturn;

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
