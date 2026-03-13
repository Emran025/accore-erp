<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\InventoryCount;
use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;

class CreatePeriodicInventoryAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('products', 'create');

        $product = Product::findOrFail($data['product_id']);
        $bookQuantity = $product->stock_quantity;
        $variance = $data['counted_quantity'] - $bookQuantity;

        $count = InventoryCount::create([
            'product_id' => $data['product_id'],
            'fiscal_period_id' => $data['fiscal_period_id'],
            'count_date' => $data['count_date'] ?? now()->format('Y-m-d'),
            'book_quantity' => $bookQuantity,
            'counted_quantity' => $data['counted_quantity'],
            'variance' => $variance,
            'notes' => $data['notes'] ?? null,
            'counted_by' => auth()->id() ?? session('user_id'),
        ]);

        TelescopeService::logOperation('CREATE', 'inventory_counts', $count->id, null, $data);

        return [
            'id' => $count->id,
            'book_quantity' => $bookQuantity,
            'variance' => $variance,
        ];
    }
}
