<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'position_code'         => $this->position_code,
            'position_title'        => $this->position_title ?? null,
            'job_title_id'          => $this->job_title_id,
            'department_id'         => $this->department_id,
            'cost_center_id'        => $this->cost_center_id ?? null,
            'role_id'               => $this->role_id ?? null,
            'headcount'             => (int) ($this->headcount ?? 1),
            'is_active'             => (bool) ($this->is_active ?? true),
            'description'           => $this->description ?? null,
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
            'department'            => new DepartmentResource($this->whenLoaded('department')),
            'job_title'             => new JobTitleResource($this->whenLoaded('jobTitle')),
        ];
    }
}
