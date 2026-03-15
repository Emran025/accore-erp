<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;

class DeleteSupplierAction
{
    public function execute(int $id): array
    {
        $supplier = ApSupplier::findOrFail($id);

        if ($supplier->current_balance > 0) {
            throw new \Exception('Cannot delete supplier with outstanding balance', 400);
        }

        $oldValues = $supplier->toArray();
        $supplier->delete();

        return $oldValues;
    }
}
