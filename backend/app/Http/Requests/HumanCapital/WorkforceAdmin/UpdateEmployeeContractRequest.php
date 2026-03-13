<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeContractRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'contract_start_date'   => 'sometimes|date',
            'contract_end_date'     => 'nullable|date',
            'probation_end_date'    => 'nullable|date',
            'base_salary'           => 'sometimes|numeric|min:0',
            'signing_bonus'         => 'nullable|numeric|min:0',
            'retention_allowance'   => 'nullable|numeric|min:0',
            'contract_type'         => 'sometimes|in:full_time,part_time,contract,freelance',
            'working_hours_per_day' => 'nullable|integer|min:1|max:24',
            'working_days_per_week' => 'nullable|integer|min:1|max:7',
            'is_current'            => 'sometimes|boolean',
            'nda_signed'            => 'sometimes|boolean',
            'non_compete_signed'    => 'sometimes|boolean',
            'contract_file_path'    => 'nullable|string',
            'notes'                 => 'nullable|string',
        ];
    }
}
