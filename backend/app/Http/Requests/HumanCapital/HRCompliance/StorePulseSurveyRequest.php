<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class StorePulseSurveyRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'survey_type' => 'nullable|string',
            'is_anonymous' => 'boolean',
            'target_audience' => 'nullable|array',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ];
    }
}
