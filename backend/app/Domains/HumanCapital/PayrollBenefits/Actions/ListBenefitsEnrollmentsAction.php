<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsEnrollment;
use Illuminate\Pagination\LengthAwarePaginator;

class ListBenefitsEnrollmentsAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $query = BenefitsEnrollment::with(['plan', 'employee']);

        if (isset($filters['plan_id'])) {
            $query->where('plan_id', $filters['plan_id']);
        }

        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('enrollment_date', 'desc')->paginate($filters['per_page'] ?? 15);
    }
}
