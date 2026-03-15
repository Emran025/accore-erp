<?php

namespace App\Http\Requests\HumanCapital\PerformanceDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLearningCourseRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'course_name'  => 'string|max:255',
            'description'  => 'nullable|string',
            'is_published' => 'boolean',
            'notes'        => 'nullable|string',
        ];
    }
}
