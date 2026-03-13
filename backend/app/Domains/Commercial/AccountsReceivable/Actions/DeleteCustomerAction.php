<?php

namespace App\Domains\Commercial\AccountsReceivable\Actions;

use App\Domains\Commercial\AccountsReceivable\Models\ArCustomer;

class DeleteCustomerAction
{
    public function execute(int $id): array
    {
        $customer = ArCustomer::findOrFail($id);
        $oldValues = $customer->toArray();
        $customer->delete();

        return $oldValues;
    }
}
