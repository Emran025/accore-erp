<?php

namespace App\Domains\Commercial\SalesRepresentatives\Actions;

use App\Domains\Commercial\Sales\Models\SalesRepresentative;

class CreateSalesRepresentativeAction
{
    public function execute(array $data, int $userId): SalesRepresentative
    {
        $exists = SalesRepresentative::where('name', $data['name'])->exists();
        if ($exists) {
            throw new \Exception('Sales Representative with this name already exists', 409);
        }

        return SalesRepresentative::create([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'created_by' => $userId,
        ]);
    }
}
