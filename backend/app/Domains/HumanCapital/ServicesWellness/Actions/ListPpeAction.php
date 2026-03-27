<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\PpeManagement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPpeAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = PpeManagement::with(['employee']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('issue_date', 'desc')->paginate(15);
    }
}
