<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\LearningEnrollment;

class UpdateLearningEnrollmentAction
{
    public function execute(int|string $id, array $data): LearningEnrollment
    {
        $enrollment = LearningEnrollment::findOrFail($id);

        if (isset($data['status']) && $data['status'] === 'completed' && !$enrollment->completion_date) {
            $data['completion_date'] = now();
            $data['progress_percentage'] = 100;

            // Check if passed
            $course = $enrollment->course;
            if ($course->requires_assessment && isset($data['score'])) {
                $data['is_passed'] = $data['score'] >= ($course->passing_score ?? 0);
            } else {
                $data['is_passed'] = true;
            }
        }

        $enrollment->update($data);
        return $enrollment->load('course', 'employee');
    }
}
