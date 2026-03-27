<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\PerformanceGoal;

class UpdatePerformanceGoalAction
{
    public function execute(int|string $id, array $data): PerformanceGoal
    {
        $goal = PerformanceGoal::findOrFail($id);

        // Auto-calculate progress if current and target values provided
        if (isset($data['current_value']) && isset($data['target_value']) && $data['target_value'] > 0) {
            $data['progress_percentage'] = min(100, round(($data['current_value'] / $data['target_value']) * 100));
        }

        if (isset($data['status']) && $data['status'] === 'completed' && !$goal->completed_date) {
            $data['completed_date'] = now();
            $data['progress_percentage'] = 100;
        }

        $goal->update($data);
        return $goal->load('employee', 'parentGoal');
    }
}
