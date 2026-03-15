<?php

namespace App\Http\Resources\Manufacturing\QualityControl;

use Illuminate\Http\Resources\Json\JsonResource;

class QaComplianceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'compliance_number'  => $this->compliance_number,
            'compliance_type'    => $this->compliance_type,
            'standard_name'      => $this->standard_name,
            'description'        => $this->description ?? null,
            'employee_id'        => $this->employee_id,
            'status'             => $this->status,
            'due_date'           => $this->due_date?->toDateString(),
            'completed_date'     => $this->completed_date?->toDateString(),
            'findings'           => $this->findings ?? null,
            'corrective_action'  => $this->corrective_action ?? null,
            'assigned_to'        => $this->assigned_to,
            'completed_by'       => $this->completed_by ?? null,
            'notes'              => $this->notes ?? null,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
            'capas'              => CapaResource::collection($this->whenLoaded('capas')),
        ];
    }
}
