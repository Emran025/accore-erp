<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
/**
 * Lists service items from the unified product catalogue.
 * Services are items where item_type = 'service'.
 */
class ListServicesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $search  = $filters['search'] ?? '';
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? $filters['limit'] ?? 20)));

        $query = Product::services()->with(['createdBy', 'category', 'serviceAvailability']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhereHas('category', fn($mq) => $mq->where('name', 'like', "%$search%"));
            });
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }
}
