<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListProductsAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('products', 'view');

        $search = $filters['search'] ?? '';
        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? 20)));

        $query = Product::with(['createdBy', 'category']);

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

        $total = $query->count();
        $products = $query->orderBy('id', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'data' => $products,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage
        ];
    }
}
