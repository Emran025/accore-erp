<?php

namespace App\Domains\Commercial\AccountsReceivable\Actions;

use App\Domains\Commercial\AccountsReceivable\Models\ArCustomer;

class UpdateCustomerAction
{
    public function execute(array $data): array
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

        $oldValues = $customer->toArray();
        $customer->update($data);

        return [
            'id' => $customer->id,
            'old_values' => $oldValues
        ];
    }
}
