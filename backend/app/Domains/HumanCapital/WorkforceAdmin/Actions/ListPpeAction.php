<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\PpeManagement;

class ListPpeAction
{
    public function execute(array $filters = []): array
    {
        $query = PpeManagement::with(['employee']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('issue_date', 'desc')->paginate(15)->toArray();
    }
}
