<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningEnrollment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListLearningEnrollmentsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = LearningEnrollment::with(['course', 'employee']);

        if (!empty($filters['course_id'])) {
            $query->where('course_id', $filters['course_id']);
        }

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('enrollment_date', 'desc')->paginate(15);
    }
}
