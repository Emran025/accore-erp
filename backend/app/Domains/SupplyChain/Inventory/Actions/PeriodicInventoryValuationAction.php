<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use Illuminate\Support\Collection;

class PeriodicInventoryValuationAction
{
    public function execute(): Collection
    {

        $totalValue = Product::selectRaw('SUM(stock_quantity * weighted_average_cost) as total')
            ->value('total') ?? 0;

        return collect([
            'total_value' => (float) $totalValue
        ]);
    }
}
