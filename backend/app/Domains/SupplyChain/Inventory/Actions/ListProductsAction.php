<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\ViewProductItem;
use Illuminate\Pagination\LengthAwarePaginator;

class ListProductsAction
{
    /**
     * Executes product list query using the v_product_items SQL view.
     *
     * Enables fast retrieval of food items (products), services, and raw materials
     * with category names, stock alerts, expiry status, and display constraints
     * without running subqueries or N+1 relation loads.
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        $search   = $filters['search'] ?? '';
        $requestedLimit = (int)($filters['limit'] ?? $filters['per_page'] ?? 20);
        $perPage  = min(2000, max(1, $requestedLimit));
        $itemType = $filters['item_type'] ?? 'product';
        $categoryId = $filters['category_id'] ?? null;
        $needsReorder = $filters['needs_reorder'] ?? null;

        $query = ViewProductItem::query();

        // 1. Filter by item_type (product = food/goods, service, raw_material, or all)
        if ($itemType !== 'all') {
            $query->where('item_type', $itemType);
        }

        // 2. Optional Category filter
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        // 3. Optional Reorder alert filter
        if ($needsReorder) {
            $query->where('needs_reorder', 1);
        }

        // 4. Fast search on pre-indexed columns
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%$search%")
                  ->orWhere('category_name', 'like', "%$search%")
                  ->orWhere('product_description', 'like', "%$search%")
                  ->orWhere('product_id', $search);
            });
        }

        return $query->orderBy('product_id', 'desc')->paginate($perPage);
    }
}

