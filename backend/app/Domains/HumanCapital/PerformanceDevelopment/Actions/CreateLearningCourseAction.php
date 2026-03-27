<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningCourse;

class CreateLearningCourseAction
{
    public function execute(array $data): LearningCourse
    {
        $data['is_published'] = false;
        $data['created_by'] = auth()->id();

        return LearningCourse::create($data);
    }
}
