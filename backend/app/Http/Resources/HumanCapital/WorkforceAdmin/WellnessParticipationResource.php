<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class WellnessParticipationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'program_id'      => $this->program_id,
            'employee_id'     => $this->employee_id,
            'status'          => $this->status ?? null,
            'enrollment_date' => $this->enrollment_date?->toDateString() ?? $this->enrollment_date,
            'metrics_data'    => $this->metrics_data ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
