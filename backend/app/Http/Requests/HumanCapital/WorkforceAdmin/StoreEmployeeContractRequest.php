<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeContractRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'          => 'required|exists:employees,id',
            'contract_start_date'  => 'required|date',
            'contract_end_date'    => 'nullable|date|after_or_equal:contract_start_date',
            'probation_end_date'   => 'nullable|date|after_or_equal:contract_start_date',
            'base_salary'          => 'required|numeric|min:0',
            'signing_bonus'        => 'nullable|numeric|min:0',
            'retention_allowance'  => 'nullable|numeric|min:0',
            'contract_type'        => 'required|in:full_time,part_time,contract,freelance',
            'working_hours_per_day'=> 'nullable|integer|min:1|max:24',
            'working_days_per_week'=> 'nullable|integer|min:1|max:7',
            'nda_signed'           => 'boolean',
            'non_compete_signed'   => 'boolean',
            'contract_file_path'   => 'nullable|string',
            'notes'                => 'nullable|string',
            'is_current'           => 'boolean',
        ];
    }
}
