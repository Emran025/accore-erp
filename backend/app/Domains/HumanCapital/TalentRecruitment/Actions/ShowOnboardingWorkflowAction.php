<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\OnboardingWorkflow;

class ShowOnboardingWorkflowAction
{
    public function execute(int|string $id): array
    {
        $workflow = OnboardingWorkflow::with(['employee', 'tasks', 'documents'])->findOrFail($id);
        return $workflow->toArray();
    }
}
