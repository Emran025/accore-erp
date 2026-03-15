<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpertiseDirectoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'skill_name'                => 'sometimes|string|max:255',
            'proficiency_level'         => 'sometimes|in:beginner,intermediate,advanced,expert',
            'years_of_experience'       => 'nullable|integer|min:0',
            'description'               => 'nullable|string',
            'is_available_for_projects' => 'sometimes|boolean',
        ];
    }
}
