<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBenefitsEnrollmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'plan_id'          => 'required|exists:benefits_plans,id',
            'employee_id'      => 'required|exists:employees,id',
            'enrollment_type'  => 'required|in:open_enrollment,new_hire,life_event,qualifying_event',
            'effective_date'   => 'required|date',
            'coverage_details' => 'nullable|array',
            'notes'            => 'nullable|string',
        ];
    }
}
