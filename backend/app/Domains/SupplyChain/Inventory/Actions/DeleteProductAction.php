<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
class DeleteProductAction
{
    public function execute(int $id): void
    {
        $product = Product::findOrFail($id);
        $oldValues = $product->toArray();
        $product->delete();

        TelescopeService::logOperation('DELETE', 'products', $id, $oldValues, null);
    }
}
