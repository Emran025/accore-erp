<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\HumanCapital\TalentDevelopment\Models\LearningCourse;

class CreateLearningCourseAction
{
    public function execute(array $data): array
    {
        $data['is_published'] = false;
        $data['created_by'] = auth()->id();

        $course = LearningCourse::create($data);
        return current($course->toArray()) ?: $course->toArray();
    }
}
