<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;

class UpdateSupplierAction
{
    public function execute(array $data): array
    {
        $supplier = ApSupplier::findOrFail($data['id']);
        $oldValues = $supplier->toArray();
        $supplier->update($data);

        return [
            'id' => $supplier->id,
            'old_values' => $oldValues
        ];
    }
}
