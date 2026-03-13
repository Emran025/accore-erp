<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\HumanCapital\TalentDevelopment\Models\PerformanceGoal;

class ListPerformanceGoalsAction
{
    public function execute(array $filters = []): array
    {
        $query = PerformanceGoal::with(['employee', 'parentGoal']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['goal_type'])) {
            $query->where('goal_type', $filters['goal_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('target_date', 'desc')->paginate(15)->toArray();
    }
}
