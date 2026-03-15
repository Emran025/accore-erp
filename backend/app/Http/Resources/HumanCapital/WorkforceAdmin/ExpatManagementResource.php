<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpatManagementResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                        => $this->id,
            'employee_id'               => $this->employee_id,
            'host_country'              => $this->host_country,
            'home_country'              => $this->home_country,
            'passport_number'           => $this->passport_number,
            'passport_expiry'           => $this->passport_expiry?->toDateString(),
            'visa_number'               => $this->visa_number ?? null,
            'visa_expiry'               => $this->visa_expiry?->toDateString(),
            'work_permit_number'        => $this->work_permit_number ?? null,
            'work_permit_expiry'        => $this->work_permit_expiry?->toDateString(),
            'residency_number'          => $this->residency_number ?? null,
            'residency_expiry'          => $this->residency_expiry?->toDateString(),
            'cost_of_living_adjustment' => (float) ($this->cost_of_living_adjustment ?? 0),
            'housing_allowance'         => (float) ($this->housing_allowance ?? 0),
            'relocation_package'        => (float) ($this->relocation_package ?? 0),
            'tax_equalization'          => (bool) ($this->tax_equalization ?? false),
            'repatriation_date'         => $this->repatriation_date?->toDateString(),
            'notes'                     => $this->notes ?? null,
            'created_by'                => $this->created_by,
            'created_at'                => $this->created_at?->toDateTimeString(),
            'updated_at'                => $this->updated_at?->toDateTimeString(),
        ];
    }
}
