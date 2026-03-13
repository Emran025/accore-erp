<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\OnboardingTask;
use App\Domains\HumanCapital\TalentAcquisition\Models\OnboardingWorkflow;

class UpdateOnboardingTaskAction
{
    public function execute(int|string $workflowId, int|string $taskId, array $data): array
    {
        $task = OnboardingTask::where('workflow_id', $workflowId)->findOrFail($taskId);

        if (isset($data['status']) && $data['status'] === 'completed' && !$task->completed_date) {
            $data['completed_date'] = now();
            $data['completed_by'] = auth()->id();
        }

        $task->update($data);

        $this->updateWorkflowProgress($workflowId);

        return current($task->toArray()) ?: reset($task); // ensure to return an array
    }

    private function updateWorkflowProgress(int|string $workflowId): void
    {
        $workflow = OnboardingWorkflow::findOrFail($workflowId);
        $totalTasks = $workflow->tasks()->count();
        $completedTasks = $workflow->tasks()->where('status', 'completed')->count();

        if ($totalTasks > 0) {
            $completionPercentage = round(($completedTasks / $totalTasks) * 100);
            $workflow->update([
                'completion_percentage'  => $completionPercentage,
                'status'                 => $completionPercentage === 100 ? 'completed' : 'in_progress',
                'actual_completion_date' => $completionPercentage === 100 ? now() : null,
            ]);
        }
    }
}
