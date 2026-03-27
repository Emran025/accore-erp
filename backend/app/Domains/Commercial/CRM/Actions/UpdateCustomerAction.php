<?php

namespace App\Domains\Commercial\CRM\Actions;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use Illuminate\Support\Collection;

class UpdateCustomerAction
{
    public function execute(array $data): Collection
    {
        $customer = ArCustomer::findOrFail($data['id']);

        $exists = ArCustomer::where('id', '!=', $customer->id)
            ->where(function ($query) use ($data) {
                $query->where('name', $data['name']);
                if (!empty($data['phone'])) {
                    $query->orWhere('phone', $data['phone']);
                }
            })
            ->exists();

        if ($exists) {
            throw new \Exception('Another customer with this name or phone already exists', 409);
        }

        $oldValues = $customer->getOriginal();
        $customer->update($data);

        return collect([
            'model' => $customer,
            'old_values' => $oldValues
        ]);
    }
}
