<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\SupplyChain\Inventory\Models\ServiceAvailability;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

/**
 * Updates an existing service catalog entry.
 * Replaces POS availability records if provided.
 */
class UpdateServiceAction
{
    public function execute(array $data): array
    {
        $userId = auth()->id() ?? session('user_id');

        return DB::transaction(function () use ($data, $userId) {
            $service = Product::services()->findOrFail($data['id']);
            $oldValues = $service->toArray();

            $posLocations = $data['pos_locations'] ?? null;
            unset($data['pos_locations']);

            // Guard: never allow changing item_type away from service via this action
            $data['item_type']         = 'service';
            $data['inventory_control'] = false;
            $data['sellable']          = true;
            $data['stock_quantity']    = 0;

            $service->update($data);

            // Replace POS availability if supplied
            if ($posLocations !== null) {
                ServiceAvailability::where('service_id', $service->id)->delete();
                foreach ($posLocations as $pos) {
                    ServiceAvailability::create([
                        'service_id'     => $service->id,
                        'pos_location'   => $pos['pos_location'],
                        'active'         => $pos['active'] ?? true,
                        'effective_from' => $pos['effective_from'] ?? null,
                        'effective_to'   => $pos['effective_to'] ?? null,
                        'notes'          => $pos['notes'] ?? null,
                        'created_by'     => $userId,
                    ]);
                }
            }

            TelescopeService::logOperation('UPDATE', 'services', $service->id, $oldValues, $data);

            return ['id' => $service->id];
        });
    }
}
