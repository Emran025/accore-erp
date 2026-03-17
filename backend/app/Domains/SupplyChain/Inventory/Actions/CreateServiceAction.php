<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\SupplyChain\Inventory\Models\ServiceAvailability;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

/**
 * Creates a new service catalog entry.
 * Services never have stock_quantity or inventory_control.
 * Optionally assigns availability to POS locations.
 */
class CreateServiceAction
{
    public function execute(array $data): array
    {
        $userId = auth()->id() ?? session('user_id');

        return DB::transaction(function () use ($data, $userId) {
            $posLocations = $data['pos_locations'] ?? [];
            unset($data['pos_locations']);

            $service = Product::create([
                'item_type'         => 'service',
                'taxable'           => $data['taxable'] ?? false,
                'inventory_control' => false,
                'sellable'          => true,
                'name'              => $data['name'],
                'description'       => $data['description'] ?? null,
                'category_id'       => $data['category_id'] ?? null,
                'unit_price'        => $data['unit_price'],
                'minimum_profit_margin' => $data['minimum_profit_margin'] ?? 0,
                'stock_quantity'    => 0,
                'unit_name'         => $data['unit_name'] ?? null,
                'sub_unit_name'     => $data['sub_unit_name'] ?? null,
                'created_by'        => $userId,
            ]);

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

            TelescopeService::logOperation('CREATE', 'services', $service->id, null, $data);

            return ['id' => $service->id];
        });
    }
}
