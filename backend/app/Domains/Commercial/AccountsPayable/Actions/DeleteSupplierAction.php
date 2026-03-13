<?php

namespace App\Domains\Commercial\AccountsPayable\Actions;

use App\Domains\Commercial\AccountsPayable\Models\ApSupplier;

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
