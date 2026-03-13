<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'full_name'            => 'required|string|max:100',
            'email'                => 'required|email|unique:employees,email|unique:users,username',
            'employee_code'        => 'nullable|string|unique:employees,employee_code',
            'password'             => 'required|min:6',
            'base_salary'          => 'required|numeric|min:0',
            'hire_date'            => 'required|date',
            'position_id'          => 'required|exists:positions,id',
            'national_id'          => 'nullable|string|max:20',
            'gosi_number'          => 'nullable|string|max:50',
            'iban'                 => 'nullable|string|max:34',
            'bank_name'            => 'nullable|string|max:100',
            'contract_type'        => ['nullable', Rule::in(['full_time', 'part_time', 'contract', 'freelance'])],
            'vacation_days_balance'=> 'nullable|numeric|min:0',
            'phone'                => 'nullable|string|max:20',
            'date_of_birth'        => 'nullable|date',
            'gender'               => 'nullable|in:male,female',
            'address'              => 'nullable|string',
            'employment_status'    => 'nullable|in:active,suspended,terminated',
            'manager_id'           => 'nullable|exists:employees,id',
            'nr_object_id'         => 'nullable|integer',
            'nr_group_id'          => 'nullable|integer',
        ];
    }
}
