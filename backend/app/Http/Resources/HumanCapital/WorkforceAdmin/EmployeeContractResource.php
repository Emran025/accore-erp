<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeContractResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'employee_id'         => $this->employee_id,
            'contract_number'     => $this->contract_number ?? null,
            'contract_type'       => $this->contract_type,
            'start_date'          => $this->start_date?->toDateString() ?? $this->start_date,
            'end_date'            => $this->end_date?->toDateString() ?? $this->end_date,
            'status'              => $this->status,
            'base_salary'         => (float) ($this->base_salary ?? 0),
            'probation_end_date'  => $this->probation_end_date?->toDateString() ?? $this->probation_end_date,
            'renewal_notes'       => $this->renewal_notes ?? null,
            'file_path'           => $this->file_path ?? null,
            'created_by'          => $this->created_by,
            'created_at'          => $this->created_at?->toDateTimeString(),
            'updated_at'          => $this->updated_at?->toDateTimeString(),
        ];
    }
}
