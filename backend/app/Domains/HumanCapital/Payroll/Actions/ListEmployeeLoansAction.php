<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\EmployeeLoan;

class ListEmployeeLoansAction
{
    public function execute(array $filters = []): array
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

        $paginated = $query->orderBy('created_at', 'desc')->paginate(15);
        return [
            'data' => $paginated->items(),
            'total' => $paginated->total(),
            'current_page' => $paginated->currentPage(),
            'per_page' => $paginated->perPage()
        ];
    }
}
