<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionPlan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListSuccessionPlansAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $query = SuccessionPlan::with(['incumbent', 'candidates.employee']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['readiness_level'])) {
            $query->where('readiness_level', $filters['readiness_level']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
