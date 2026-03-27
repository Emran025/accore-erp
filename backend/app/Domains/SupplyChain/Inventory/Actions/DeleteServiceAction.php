<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

use Illuminate\Support\Collection;

/**
 * Deletes a service catalog entry.
 * Guards against deleting items of the wrong type.
 */
class DeleteServiceAction
{
    public function execute(int $id): Collection
    {
        $service = Product::services()->findOrFail($id);
        $oldValues = $service->toArray();
        $service->delete();

        TelescopeService::logOperation('DELETE', 'services', $id, $oldValues, null);

        return collect($oldValues);
    }
}
