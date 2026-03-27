<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
class UpdateProductAction
{
    public function execute(array $data, ?int $id = null): Product
    {
        $id = $id ?? $data['id'];
        $product = Product::findOrFail($id);
        $oldValues = $product->toArray();
        $product->update($data);

        TelescopeService::logOperation('UPDATE', 'products', $product->id, $oldValues, $data);

        return $product;
    }
}
