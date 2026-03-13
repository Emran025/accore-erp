<?php

namespace App\Http\Requests\HumanCapital\TalentAcquisition;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequisitionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'job_title'                => 'required|string|max:255',
            'job_description'          => 'nullable|string',
            'department_id'            => 'nullable|exists:departments,id',
            'role_id'                  => 'nullable|exists:roles,id',
            'number_of_positions'      => 'required|integer|min:1',
            'employment_type'          => 'required|in:full_time,part_time,contract,temporary',
            'budgeted_salary_min'      => 'nullable|numeric|min:0',
            'budgeted_salary_max'      => 'nullable|numeric|min:0',
            'target_start_date'        => 'nullable|date',
            'required_qualifications'  => 'nullable|string',
            'preferred_qualifications' => 'nullable|string',
            'notes'                    => 'nullable|string',
        ];
    }
}
