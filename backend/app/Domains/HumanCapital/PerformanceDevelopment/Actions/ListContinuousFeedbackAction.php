<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\ContinuousFeedback;

class ListContinuousFeedbackAction
{
    public function execute(array $filters = []): array
    {
        $query = ContinuousFeedback::with(['employee', 'givenBy']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['feedback_type'])) {
            $query->where('feedback_type', $filters['feedback_type']);
        }

        return $query->orderBy('feedback_date', 'desc')->paginate(15)->toArray();
    }
}
