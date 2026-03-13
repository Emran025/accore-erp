<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
class UpdateProductAction
{
    public function execute(array $data): array
    {
        $product = Product::findOrFail($data['id']);
        $oldValues = $product->toArray();
        $product->update($data);

        TelescopeService::logOperation('UPDATE', 'products', $product->id, $oldValues, $data);

        return ['id' => $product->id];
    }
}
