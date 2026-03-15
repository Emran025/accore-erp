<?php

namespace App\Http\Resources\Manufacturing\QualityControl;

use Illuminate\Http\Resources\Json\JsonResource;

class CapaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'capa_number'      => $this->capa_number,
            'compliance_id'    => $this->compliance_id,
            'employee_id'      => $this->employee_id,
            'type'             => $this->type,
            'issue_description' => $this->issue_description,
            'root_cause'       => $this->root_cause ?? null,
            'action_plan'      => $this->action_plan ?? null,
            'status'           => $this->status,
            'target_date'      => $this->target_date?->toDateString(),
            'completed_date'   => $this->completed_date?->toDateString(),
            'verification'     => $this->verification ?? null,
            'assigned_to'      => $this->assigned_to,
            'completed_by'     => $this->completed_by ?? null,
            'notes'            => $this->notes ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
