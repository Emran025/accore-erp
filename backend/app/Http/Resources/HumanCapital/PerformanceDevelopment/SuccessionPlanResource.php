<?php

namespace App\Http\Resources\HumanCapital\PerformanceDevelopment;

use Illuminate\Http\Resources\Json\JsonResource;

class SuccessionPlanResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'position_id'     => $this->position_id,
            'plan_name'       => $this->plan_name ?? null,
            'status'          => $this->status ?? null,
            'review_date'     => $this->review_date?->toDateString() ?? $this->review_date,
            'notes'           => $this->notes ?? null,
            'created_by'      => $this->created_by ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
            'candidates'      => SuccessionCandidateResource::collection($this->whenLoaded('candidates')),
        ];
    }
}
