<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class ListExpertiseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'skill_name' => 'nullable|string',
            'proficiency_level' => 'nullable|string',
            'is_available_for_projects' => 'nullable|string|in:true,false,1,0',
        ];
    }
}
