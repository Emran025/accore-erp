<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\OnboardingWorkflow;
use App\Domains\HumanCapital\TalentRecruitment\Models\OnboardingTask;
use Illuminate\Support\Facades\DB;

class CreateOnboardingWorkflowAction
{
    public function execute(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $data['status'] = 'not_started';
            $data['completion_percentage'] = 0;

            $workflow = OnboardingWorkflow::create($data);

            $this->createDefaultTasks($workflow);

            return $workflow->load('employee', 'tasks')->toArray();
        });
    }

    private function createDefaultTasks(OnboardingWorkflow $workflow): void
    {
        $defaultTasks = [];

        if ($workflow->workflow_type === 'onboarding') {
            $defaultTasks = [
                ['task_name' => 'إنشاء معرف النظام', 'task_type' => 'system_id', 'department' => 'it', 'sequence_order' => 1],
                ['task_name' => 'تخصيص المعدات', 'task_type' => 'it_provisioning', 'department' => 'it', 'sequence_order' => 2],
                ['task_name' => 'إصدار بطاقة الدخول', 'task_type' => 'badge_access', 'department' => 'security', 'sequence_order' => 3],
                ['task_name' => 'استكمال المستندات', 'task_type' => 'document', 'department' => 'hr', 'sequence_order' => 4],
                ['task_name' => 'التدريب الأساسي', 'task_type' => 'training', 'department' => 'hr', 'sequence_order' => 5],
            ];
        } else {
            $defaultTasks = [
                ['task_name' => 'استرجاع المعدات', 'task_type' => 'it_provisioning', 'department' => 'it', 'sequence_order' => 1],
                ['task_name' => 'إلغاء بطاقة الدخول', 'task_type' => 'badge_access', 'department' => 'security', 'sequence_order' => 2],
                ['task_name' => 'إلغاء الوصول للنظام', 'task_type' => 'system_id', 'department' => 'it', 'sequence_order' => 3],
                ['task_name' => 'مقابلة الخروج', 'task_type' => 'other', 'department' => 'hr', 'sequence_order' => 4],
            ];
        }

        foreach ($defaultTasks as $task) {
            OnboardingTask::create([
                'workflow_id'    => $workflow->id,
                'task_name'      => $task['task_name'],
                'task_type'      => $task['task_type'],
                'department'     => $task['department'],
                'status'         => 'pending',
                'sequence_order' => $task['sequence_order'],
            ]);
        }
    }
}
