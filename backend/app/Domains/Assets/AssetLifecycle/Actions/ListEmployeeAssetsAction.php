<?php

namespace App\Domains\Assets\AssetLifecycle\Actions;

use App\Domains\Assets\AssetLifecycle\Models\EmployeeAsset;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListEmployeeAssetsAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $query = EmployeeAsset::with(['employee', 'costCenter']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }
}
