<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;

/**
 * Lists service items from the unified product catalogue.
 * Services are items where item_type = 'service'.
 */
class ListServicesAction
{
    public function execute(array $filters): array
    {
        $search  = $filters['search'] ?? '';
        $page    = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? 20)));

        $query = Product::services()->with(['createdBy', 'category', 'serviceAvailability']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhereHas('category', fn($mq) => $mq->where('name', 'like', "%$search%"));
            });
        }

        $total    = $query->count();
        $services = $query->orderBy('id', 'desc')
                          ->skip(($page - 1) * $perPage)
                          ->take($perPage)
                          ->get();

        return [
            'data'     => $services,
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ];
    }
}
