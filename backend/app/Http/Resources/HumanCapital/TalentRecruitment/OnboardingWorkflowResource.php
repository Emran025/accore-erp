<?php

namespace App\Http\Resources\HumanCapital\TalentRecruitment;

use Illuminate\Http\Resources\Json\JsonResource;

class OnboardingWorkflowResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'workflow_name'   => $this->workflow_name ?? null,
            'status'          => $this->status,
            'start_date'      => $this->start_date?->toDateString() ?? $this->start_date,
            'end_date'        => $this->end_date?->toDateString() ?? $this->end_date,
            'notes'           => $this->notes ?? null,
            'created_by'      => $this->created_by ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
            'tasks'           => OnboardingTaskResource::collection($this->whenLoaded('tasks')),
        ];
    }
}
