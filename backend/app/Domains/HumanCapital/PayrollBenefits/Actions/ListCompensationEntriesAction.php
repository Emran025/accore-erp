<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\CompensationEntry;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListCompensationEntriesAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = CompensationEntry::with(['plan', 'employee']);

        if (!empty($filters['compensation_plan_id'])) {
            $query->where('compensation_plan_id', $filters['compensation_plan_id']);
        }

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
