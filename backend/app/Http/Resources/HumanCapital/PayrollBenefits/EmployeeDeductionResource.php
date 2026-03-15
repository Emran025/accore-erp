<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeDeductionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'deduction_type'  => $this->deduction_type ?? null,
            'component_id'    => $this->component_id ?? null,
            'amount'          => (float) ($this->amount ?? 0),
            'effective_from'  => $this->effective_from?->toDateString() ?? $this->effective_from,
            'effective_to'    => $this->effective_to?->toDateString() ?? $this->effective_to,
            'is_active'       => (bool) ($this->is_active ?? true),
            'notes'           => $this->notes ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
