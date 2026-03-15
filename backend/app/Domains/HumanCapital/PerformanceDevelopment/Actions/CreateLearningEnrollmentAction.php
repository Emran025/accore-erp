<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningEnrollment;

class CreateLearningEnrollmentAction
{
    public function execute(array $data): array
    {
        $data['enrollment_date'] = now();
        $data['status'] = 'enrolled';
        $data['progress_percentage'] = 0;

        if ($data['enrollment_type'] === 'assigned' || $data['enrollment_type'] === 'mandatory') {
            $data['assigned_by'] = auth()->id();
        }

        $enrollment = LearningEnrollment::create($data);
        return $enrollment->load('course', 'employee')->toArray();
    }
}
