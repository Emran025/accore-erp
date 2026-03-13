<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBenefitsPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'plan_code'               => 'required|string|max:50|unique:benefits_plans,plan_code',
            'plan_name'               => 'required|string|max:255',
            'plan_type'               => 'required|in:health,dental,vision,life_insurance,disability,retirement,fsa,hsa,other',
            'description'             => 'nullable|string',
            'eligibility_rule'        => 'required|in:all,full_time,tenure,role,custom',
            'eligibility_criteria'    => 'nullable|array',
            'employee_contribution'   => 'nullable|numeric|min:0',
            'employer_contribution'   => 'nullable|numeric|min:0',
            'effective_date'          => 'required|date',
            'expiry_date'             => 'nullable|date|after:effective_date',
        ];
    }
}
