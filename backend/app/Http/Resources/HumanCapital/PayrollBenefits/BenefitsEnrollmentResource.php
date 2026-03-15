<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\EmployeeResource;

class BenefitsEnrollmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'plan_id'         => $this->plan_id,
            'employee_id'     => $this->employee_id,
            'enrollment_date' => $this->enrollment_date,
            'end_date'        => $this->end_date,
            'coverage_amount' => (float) $this->coverage_amount,
            'employee_cost'   => (float) $this->employee_cost,
            'employer_cost'   => (float) $this->employer_cost,
            'status'          => $this->status,
            'notes'           => $this->notes,
            'plan'            => new BenefitsPlanResource($this->whenLoaded('plan')),
            'employee'        => new EmployeeResource($this->whenLoaded('employee')),
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
