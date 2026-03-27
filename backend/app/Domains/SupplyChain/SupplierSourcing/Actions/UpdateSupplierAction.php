<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
class UpdateSupplierAction
{
    public function execute(array $data): ApSupplier
    {
        $supplier = ApSupplier::findOrFail($data['id']);
        $oldValues = $supplier->toArray();
        $supplier->update($data);

        TelescopeService::logOperation('UPDATE', 'ap_suppliers', $supplier->id, $oldValues, $data);

        return $supplier;
    }
}
