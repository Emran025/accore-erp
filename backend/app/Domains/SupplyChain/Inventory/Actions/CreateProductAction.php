<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Domains\SupplyChain\Inventory\Services\InventoryCostingService;
use App\Support\Localization\LocalizedValue;
use Illuminate\Support\Facades\DB;

class CreateProductAction
{
    public function __construct(
        private readonly InventoryCostingService $costingService
    ) {}

    public function execute(array $data): Product
    {
        
        foreach (['name', 'description', 'unit_name', 'sub_unit_name'] as $attribute) {
            $data = LocalizedValue::normaliseInput($data, $attribute);
        }
        $data['created_by'] = auth()->id() ?? session('user_id');
        $initialQuantity = (int) ($data['stock_quantity'] ?? 0);
        $initialUnitCost = (float) ($data['weighted_average_cost'] ?? 0);
        if ($initialUnitCost <= 0) {
            $initialUnitCost = (float) ($data['purchase_price'] ?? 0);
        }
        if ($initialQuantity > 0) {
            $data['weighted_average_cost'] = $initialUnitCost;
        }

        return DB::transaction(function () use ($data, $initialQuantity, $initialUnitCost) {
            $product = Product::create($data);

            // CRITICAL FIX: If product is created with initial stock, we MUST create a costing layer
            // Otherwise, SalesService will fail due to missing inventory layers.
            if ($product->stock_quantity > 0) {
                $this->costingService->recordPurchase(
                    $product->id,
                    0, // Reference ID 0 for initialization
                    $initialQuantity,
                    $initialUnitCost,
                    $initialQuantity * $initialUnitCost,
                    'FIFO',
                    'initial_stock',
                    $product->id
                );
            }

            TelescopeService::logOperation('CREATE', 'products', $product->id, null, $data);

            return $product;
        });
    }
}
