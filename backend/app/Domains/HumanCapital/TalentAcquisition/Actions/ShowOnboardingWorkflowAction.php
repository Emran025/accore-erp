<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\OnboardingWorkflow;

class ShowOnboardingWorkflowAction
{
    public function execute(int|string $id): array
    {
        $workflow = OnboardingWorkflow::with(['employee', 'tasks', 'documents'])->findOrFail($id);
        return $workflow->toArray();
    }
}
