<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Domains\SupplyChain\Inventory\Services\InventoryCostingService;
use Illuminate\Support\Facades\DB;

class CreateProductAction
{
    public function __construct(
        private readonly InventoryCostingService $costingService
    ) {}

    public function execute(array $data): Product
    {
        
        $data['created_by'] = auth()->id() ?? session('user_id');

        return DB::transaction(function () use ($data) {
            $product = Product::create($data);

            // CRITICAL FIX: If product is created with initial stock, we MUST create a costing layer
            // Otherwise, SalesService will fail due to missing inventory layers.
            if ($product->stock_quantity > 0) {
                $this->costingService->recordPurchase(
                    $product->id,
                    0, // Reference ID 0 for initialization
                    $product->stock_quantity,
                    0, // Cost is unknown at this point unless weighted_average_cost is provided
                    0,
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
