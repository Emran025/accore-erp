<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningCourse;

class ShowLearningCourseAction
{
    public function execute(int|string $id): array
    {
        $course = LearningCourse::with(['enrollments.employee'])->findOrFail($id);
        return $course->toArray();
    }
}
