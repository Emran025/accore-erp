<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeRelationsCaseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'case_number'     => $this->case_number ?? null,
            'case_type'       => $this->case_type,
            'description'     => $this->description ?? null,
            'status'          => $this->status,
            'priority'        => $this->priority ?? null,
            'open_date'       => $this->open_date?->toDateString() ?? $this->open_date,
            'close_date'      => $this->close_date?->toDateString() ?? $this->close_date,
            'resolution'      => $this->resolution ?? null,
            'reported_by'     => $this->reported_by ?? null,
            'assigned_to'     => $this->assigned_to ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
