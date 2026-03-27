<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeLoan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListEmployeeLoansAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = EmployeeLoan::with(['employee', 'repayments']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['loan_type'])) {
            $query->where('loan_type', $filters['loan_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
