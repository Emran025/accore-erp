<?php

namespace App\Http\Resources\HumanCapital\PerformanceDevelopment;

use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceGoalResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'employee_id'   => $this->employee_id,
            'goal_title'    => $this->goal_title ?? $this->title ?? null,
            'description'   => $this->description ?? null,
            'goal_type'     => $this->goal_type ?? null,
            'status'        => $this->status,
            'priority'      => $this->priority ?? null,
            'target_date'   => $this->target_date?->toDateString() ?? $this->target_date,
            'achieved_date' => $this->achieved_date?->toDateString() ?? $this->achieved_date,
            'progress'      => $this->progress ? (float) $this->progress : null,
            'notes'         => $this->notes ?? null,
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
        ];
    }
}
