<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class WellnessProgramResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'program_name'   => $this->program_name,
            'description'    => $this->description ?? null,
            'program_type'   => $this->program_type,
            'start_date'     => $this->start_date?->toDateString(),
            'end_date'       => $this->end_date?->toDateString(),
            'is_active'      => (bool) $this->is_active,
            'target_metrics' => $this->target_metrics,
            'created_by'     => $this->created_by,
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}
