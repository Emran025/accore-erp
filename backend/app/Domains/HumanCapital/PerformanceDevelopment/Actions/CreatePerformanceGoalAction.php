<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\PerformanceGoal;

class CreatePerformanceGoalAction
{
    public function execute(array $data): PerformanceGoal
    {
        $data['status'] = 'not_started';
        $data['progress_percentage'] = 0;
        $data['current_value'] = $data['current_value'] ?? 0;
        $data['created_by'] = auth()->id();

        $goal = PerformanceGoal::create($data);
        return $goal->load('employee', 'parentGoal');
    }
}
