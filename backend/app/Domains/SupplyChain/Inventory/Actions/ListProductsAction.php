<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
class ListProductsAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $search   = $filters['search'] ?? '';
        $perPage  = min(100, max(1, (int)($filters['per_page'] ?? 20)));
        $itemType = $filters['item_type'] ?? 'product';

        $query = Product::with(['createdBy', 'category']);

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

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }
}
