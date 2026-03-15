<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class StoreSurveyResponseRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'responses' => 'required|array',
            'comments' => 'nullable|string',
        ];
    }
}
