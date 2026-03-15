<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningCourse;

class UpdateLearningCourseAction
{
    public function execute(int|string $id, array $data): array
    {
        $course = LearningCourse::findOrFail($id);
        $course->update($data);

        return $course->load('enrollments')->toArray();
    }
}
