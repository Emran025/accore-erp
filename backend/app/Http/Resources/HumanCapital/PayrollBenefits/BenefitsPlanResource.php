<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class BenefitsPlanResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'plan_code'             => $this->plan_code,
            'plan_name'             => $this->plan_name,
            'plan_type'             => $this->plan_type,
            'description'           => $this->description ?? null,
            'eligibility_rule'      => $this->eligibility_rule ?? null,
            'eligibility_criteria'  => $this->eligibility_criteria,
            'employee_contribution' => (float) $this->employee_contribution,
            'employer_contribution' => (float) $this->employer_contribution,
            'effective_date'        => $this->effective_date?->toDateString(),
            'expiry_date'           => $this->expiry_date?->toDateString(),
            'is_active'             => (bool) $this->is_active,
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
        ];
    }
}
