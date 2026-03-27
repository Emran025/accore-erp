<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Actions;

use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListSuppliersAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? $filters['limit'] ?? 20)));
        $search = $filters['search'] ?? '';

        $query = ApSupplier::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('tax_number', 'like', "%$search%");
            });
        }

        return $query->orderBy('name')->paginate($perPage);
    }
}
