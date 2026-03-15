<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpertiseDirectoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'               => 'required|exists:employees,id',
            'skill_name'                => 'required|string|max:255',
            'proficiency_level'         => 'required|in:beginner,intermediate,advanced,expert',
            'years_of_experience'       => 'nullable|integer|min:0',
            'description'               => 'nullable|string',
            'certifications'            => 'nullable|array',
            'projects'                  => 'nullable|array',
            'is_available_for_projects' => 'boolean',
        ];
    }
}
