<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\HumanCapital\TalentDevelopment\Models\PerformanceAppraisal;

class ListPerformanceAppraisalsAction
{
    public function execute(array $filters = []): array
    {
        $query = PerformanceAppraisal::with(['employee']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['appraisal_type'])) {
            $query->where('appraisal_type', $filters['appraisal_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('appraisal_date', 'desc')->paginate(15)->toArray();
    }
}
