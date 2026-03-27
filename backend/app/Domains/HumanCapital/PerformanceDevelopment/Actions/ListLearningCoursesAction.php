<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningCourse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListLearningCoursesAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = LearningCourse::with(['enrollments']);

        if (!empty($filters['course_type'])) {
            $query->where('course_type', $filters['course_type']);
        }

        if (!empty($filters['delivery_method'])) {
            $query->where('delivery_method', $filters['delivery_method']);
        }

        if (isset($filters['is_published'])) {
            $query->where('is_published', filter_var($filters['is_published'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
