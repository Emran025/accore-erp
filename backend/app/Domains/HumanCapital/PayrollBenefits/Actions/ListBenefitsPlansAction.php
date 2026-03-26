<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsPlan;
use Illuminate\Pagination\LengthAwarePaginator;

class ListBenefitsPlansAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $query = BenefitsPlan::with(['enrollments']);

        if (isset($filters['plan_type'])) {
            $query->where('plan_type', $filters['plan_type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active'] === 'true' || $filters['is_active'] === true);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }
}
