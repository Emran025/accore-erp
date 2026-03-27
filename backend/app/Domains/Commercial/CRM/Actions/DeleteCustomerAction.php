<?php

namespace App\Domains\Commercial\CRM\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use Illuminate\Support\Collection;

class DeleteCustomerAction
{
    public function execute(int $id): Collection
    {
        $customer = ArCustomer::findOrFail($id);
        $oldValues = $customer->toArray();
        $customer->delete();

        return collect($oldValues);
    }
}
