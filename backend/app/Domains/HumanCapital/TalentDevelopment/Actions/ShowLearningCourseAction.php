<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\HumanCapital\TalentDevelopment\Models\LearningCourse;

class ShowLearningCourseAction
{
    public function execute(int|string $id): array
    {
        $course = LearningCourse::with(['enrollments.employee'])->findOrFail($id);
        return $course->toArray();
    }
}
