<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\CompensationPlan;

class ListCompensationPlansAction
{
    public function execute(array $filters = []): array
    {
        $query = CompensationPlan::with(['entries.employee']);

        if (!empty($filters['plan_type'])) {
            $query->where('plan_type', $filters['plan_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['fiscal_year'])) {
            $query->where('fiscal_year', $filters['fiscal_year']);
        }

        $paginated = $query->orderBy('effective_date', 'desc')->paginate(15);
        return [
            'data' => $paginated->items(),
            'total' => $paginated->total(),
            'current_page' => $paginated->currentPage(),
            'per_page' => $paginated->perPage()
        ];
    }
}
