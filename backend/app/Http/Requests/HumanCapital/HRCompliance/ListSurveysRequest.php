<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class ListSurveysRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'survey_type' => 'nullable|string',
            'is_active' => 'nullable|string|in:true,false,1,0',
        ];
    }
}
