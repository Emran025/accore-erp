<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'employee_code'         => $this->employee_code,
            'full_name'             => $this->full_name,
            'email'                 => $this->email,
            'phone'                 => $this->phone,
            'national_id'           => $this->national_id,
            'gosi_number'           => $this->gosi_number,
            'date_of_birth'         => $this->date_of_birth?->toDateString(),
            'gender'                => $this->gender,
            'address'               => $this->address,
            'role_id'               => $this->role_id,
            'job_title_id'          => $this->job_title_id,
            'position_id'           => $this->position_id,
            'department_id'         => $this->department_id,
            'manager_id'            => $this->manager_id,
            'hire_date'             => $this->hire_date?->toDateString(),
            'termination_date'      => $this->termination_date?->toDateString(),
            'employment_status'     => $this->employment_status,
            'contract_type'         => $this->contract_type,
            'vacation_days_balance' => (float) $this->vacation_days_balance,
            'base_salary'           => (float) $this->base_salary,
            'iban'                  => $this->iban,
            'bank_name'             => $this->bank_name,
            'is_active'             => (bool) $this->is_active,
            'created_by'            => $this->created_by,
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
            'department'            => new DepartmentResource($this->whenLoaded('department')),
            'job_title'             => new JobTitleResource($this->whenLoaded('jobTitle')),
            'position'              => new PositionResource($this->whenLoaded('position')),
        ];
    }
}
