<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListContractsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = EmployeeContract::with(['employee', 'creator'])->orderByDesc('contract_start_date');

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['is_current'])) {
            $query->where('is_current', $filters['is_current'] === 'true' || $filters['is_current'] === true);
        }

        return $query->paginate(15);
    }
}
