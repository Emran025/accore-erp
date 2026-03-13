<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('employee');

        // Note: The unique user username rule might need to be retrieved from context, this is an approximation 
        // that handles the explicit ignore inside the controller logic better by leaving ignoring generic
        // A full fix requires passing the user_id into the rule, which could be done via custom rules or retrieving the employee.

        return [
            'full_name'             => 'sometimes|string|max:100',
            'email'                 => ['sometimes','email', Rule::unique('employees')->ignore($id)], 
            'employee_code'         => ['sometimes','string', Rule::unique('employees')->ignore($id)],
            'base_salary'           => 'sometimes|numeric|min:0',
            'hire_date'             => 'sometimes|date',
            'position_id'           => 'sometimes|exists:positions,id',
            'national_id'           => 'nullable|string|max:20',
            'gosi_number'           => 'nullable|string|max:50',
            'iban'                  => 'nullable|string|max:34',
            'bank_name'             => 'nullable|string|max:100',
            'contract_type'         => ['nullable', Rule::in(['full_time', 'part_time', 'contract', 'freelance'])],
            'vacation_days_balance' => 'nullable|numeric|min:0',
            'phone'                 => 'nullable|string|max:20',
            'date_of_birth'         => 'nullable|date',
            'gender'                => 'nullable|in:male,female',
            'address'               => 'nullable|string',
            'manager_id'            => 'nullable|exists:employees,id',
            'employment_status'     => 'nullable|in:active,suspended,terminated',
            'password'              => 'nullable|string|min:6',
        ];
    }
}
