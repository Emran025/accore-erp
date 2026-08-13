<?php

namespace App\Domains\Commercial\MarketingDistribution\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\SalesRepresentative;

class UpdateSalesRepresentativeAction
{
    public function execute(array $data): SalesRepresentative
    {
        $representative = SalesRepresentative::findOrFail($data['id']);

        $exists = SalesRepresentative::where('id', '!=', $representative->id)
            ->where('name', $data['name'])
            ->exists();

        if ($exists) {
            throw new \Exception('Another representative with this name already exists', 409);
        }

        $representative->update([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        return $representative->fresh();
    }
}
