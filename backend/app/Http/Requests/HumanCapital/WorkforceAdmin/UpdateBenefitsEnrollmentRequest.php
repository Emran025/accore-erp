<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBenefitsEnrollmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'           => 'sometimes|in:enrolled,active,terminated,cancelled',
            'termination_date' => 'nullable|date',
            'coverage_details' => 'nullable|array',
            'notes'            => 'nullable|string',
        ];
    }
}
