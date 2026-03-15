<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\EnterpriseCore\IdentityAccess\RoleResource;

class EmployeeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'employee_code' => $this->employee_code,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'national_id' => $this->national_id,
            'gosi_number' => $this->gosi_number,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender,
            'address' => $this->address,
            'hire_date' => $this->hire_date?->toDateString(),
            'termination_date' => $this->termination_date?->toDateString(),
            'employment_status' => $this->employment_status,
            'contract_type' => $this->contract_type,
            'vacation_days_balance' => (float)$this->vacation_days_balance,
            'base_salary' => (float)$this->base_salary,
            'iban' => $this->iban,
            'bank_name' => $this->bank_name,
            'is_active' => (bool)$this->is_active,
            'created_at' => $this->created_at?->toDateTimeString(),

            // Relationships
            'role' => new RoleResource($this->whenLoaded('role')),
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'position' => $this->whenLoaded('position', function() {
                return [
                    'id' => $this->position->id,
                    'name' => $this->position->name,
                    'job_title' => $this->position->jobTitle?->name,
                ];
            }),
            'manager' => new EmployeeResource($this->whenLoaded('manager')),
        ];
    }
}
