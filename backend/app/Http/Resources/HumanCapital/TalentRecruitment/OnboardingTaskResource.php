<?php

namespace App\Http\Resources\HumanCapital\TalentRecruitment;

use Illuminate\Http\Resources\Json\JsonResource;

class OnboardingTaskResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'workflow_id'         => $this->workflow_id ?? null,
            'employee_id'         => $this->employee_id ?? null,
            'task_name'           => $this->task_name,
            'task_description'    => $this->task_description ?? null,
            'assigned_to'         => $this->assigned_to ?? null,
            'due_date'            => $this->due_date?->toDateString() ?? $this->due_date,
            'completed_date'      => $this->completed_date?->toDateString() ?? $this->completed_date,
            'status'              => $this->status,
            'priority'            => $this->priority ?? null,
            'notes'               => $this->notes ?? null,
            'created_at'          => $this->created_at?->toDateTimeString(),
        ];
    }
}
