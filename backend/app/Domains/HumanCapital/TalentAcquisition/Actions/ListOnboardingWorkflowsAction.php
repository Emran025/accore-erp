<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\OnboardingWorkflow;

class ListOnboardingWorkflowsAction
{
    public function execute(array $filters = []): array
    {
        $query = OnboardingWorkflow::with(['employee', 'tasks', 'documents']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['workflow_type'])) {
            $query->where('workflow_type', $filters['workflow_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15)->toArray();
    }
}
