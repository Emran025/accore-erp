<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class ListBenefitsEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plan_id' => 'nullable|integer|exists:benefits_plans,id',
            'employee_id' => 'nullable|integer|exists:employees,id',
            'status' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }
}
