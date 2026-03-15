<?php

namespace App\Http\Resources\HumanCapital\PerformanceDevelopment;

use Illuminate\Http\Resources\Json\JsonResource;

class SuccessionCandidateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'succession_plan_id'  => $this->succession_plan_id,
            'employee_id'         => $this->employee_id,
            'readiness_level'     => $this->readiness_level ?? null,
            'priority'            => (int) ($this->priority ?? 0),
            'development_notes'   => $this->development_notes ?? null,
            'notes'               => $this->notes ?? null,
            'created_at'          => $this->created_at?->toDateTimeString(),
        ];
    }
}
