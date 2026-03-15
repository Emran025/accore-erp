<?php

namespace App\Http\Resources\HumanCapital\ServicesWellness;

use Illuminate\Http\Resources\Json\JsonResource;

class TravelRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'employee_id'      => $this->employee_id,
            'destination'      => $this->destination,
            'purpose'          => $this->purpose ?? null,
            'departure_date'   => $this->departure_date?->toDateString() ?? $this->departure_date,
            'return_date'      => $this->return_date?->toDateString() ?? $this->return_date,
            'status'           => $this->status,
            'estimated_cost'   => $this->estimated_cost ? (float) $this->estimated_cost : null,
            'approved_by'      => $this->approved_by ?? null,
            'approved_at'      => $this->approved_at?->toDateTimeString() ?? $this->approved_at,
            'notes'            => $this->notes ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
