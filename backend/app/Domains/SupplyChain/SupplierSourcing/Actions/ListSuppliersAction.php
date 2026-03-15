<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;

class ListSuppliersAction
{
    public function execute(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $search = $filters['search'] ?? '';

        $query = ApSupplier::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('tax_number', 'like', "%$search%");
            });
        }

        $total = $query->count();
        $suppliers = $query->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'data' => $suppliers,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
        ];
    }
}
