<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class PayrollEntryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'payroll_cycle_id'   => $this->payroll_cycle_id,
            'employee_id'        => $this->employee_id,
            'base_salary'        => (float) ($this->base_salary ?? 0),
            'total_allowances'   => (float) ($this->total_allowances ?? 0),
            'total_deductions'   => (float) ($this->total_deductions ?? 0),
            'gosi_employee'      => (float) ($this->gosi_employee ?? 0),
            'gosi_employer'      => (float) ($this->gosi_employer ?? 0),
            'net_salary'         => (float) ($this->net_salary ?? 0),
            'gross_salary'       => (float) ($this->gross_salary ?? 0),
            'status'             => $this->status,
            'notes'              => $this->notes ?? null,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
