<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class PeriodicInventoryValuationAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('products', 'view');

        $totalValue = Product::selectRaw('SUM(stock_quantity * weighted_average_cost) as total')
            ->value('total') ?? 0;

        return [
            'total_value' => (float) $totalValue
        ];
    }
}
