<?php

namespace App\Domains\Commercial\CRM\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;

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
