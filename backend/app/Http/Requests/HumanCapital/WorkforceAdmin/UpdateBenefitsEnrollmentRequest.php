<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBenefitsEnrollmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        if ($this->route('id')) {
            $this->merge(['id' => $this->route('id')]);
        }
    }

    public function rules(): array
    {
        return [
            'id'               => 'required|exists:benefits_enrollments,id',
            'status'           => 'sometimes|in:enrolled,active,terminated,cancelled',
            'termination_date' => 'nullable|date',
            'coverage_details' => 'nullable|array',
            'notes'            => 'nullable|string',
        ];
    }
}
