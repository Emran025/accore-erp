<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;

class ListProductsAction
{
    public function execute(array $filters): array
    {
        $search   = $filters['search'] ?? '';
        $page     = max(1, (int)($filters['page'] ?? 1));
        $perPage  = min(100, max(1, (int)($filters['per_page'] ?? 20)));
        $itemType = $filters['item_type'] ?? 'product'; // default: only physical products

        $query = Product::with(['createdBy', 'category']);

        // Filter by item type. Passing 'all' returns everything.
        if ($itemType !== 'all') {
            $query->where('item_type', $itemType);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhereHas('category', function ($mq) use ($search) {
                       $mq->where('name', 'like', "%$search%");
                  })
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhere('id', 'like', "%$search%");
            });
        }

        $total    = $query->count();
        $products = $query->orderBy('id', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'data'     => $products,
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ];
    }
}
