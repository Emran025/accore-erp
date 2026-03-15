<?php

namespace App\Http\Resources\HumanCapital\ServicesWellness;

use Illuminate\Http\Resources\Json\JsonResource;

class EhsIncidentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'incident_number'     => $this->incident_number ?? null,
            'employee_id'         => $this->employee_id,
            'incident_type'       => $this->incident_type,
            'description'         => $this->description ?? null,
            'incident_date'       => $this->incident_date?->toDateString() ?? $this->incident_date,
            'location'            => $this->location ?? null,
            'severity'            => $this->severity ?? null,
            'status'              => $this->status,
            'investigation_notes' => $this->investigation_notes ?? null,
            'corrective_action'   => $this->corrective_action ?? null,
            'reported_by'         => $this->reported_by ?? null,
            'created_at'          => $this->created_at?->toDateTimeString(),
            'updated_at'          => $this->updated_at?->toDateTimeString(),
        ];
    }
}
