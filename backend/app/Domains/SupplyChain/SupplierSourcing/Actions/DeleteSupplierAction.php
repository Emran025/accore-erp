<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Collection;

class DeleteSupplierAction
{
    public function execute(int $id): Collection
    {
        $supplier = ApSupplier::findOrFail($id);

        if ($supplier->current_balance > 0) {
            throw new \Exception('Cannot delete supplier with outstanding balance', 400);
        }

        $oldValues = $supplier->toArray();
        $supplier->delete();

        TelescopeService::logOperation('DELETE', 'ap_suppliers', $id, $oldValues, null);

        return collect($oldValues);
    }
}
