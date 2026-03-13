<?php

namespace App\Http\Requests\HumanCapital\TalentDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class StoreLearningCourseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_code'         => 'required|string|max:50|unique:learning_courses,course_code',
            'course_name'         => 'required|string|max:255',
            'description'         => 'nullable|string',
            'delivery_method'     => 'required|in:in_person,virtual,elearning,blended',
            'course_type'         => 'required|in:mandatory,optional,compliance,development',
            'duration_hours'      => 'nullable|integer|min:0',
            'scorm_path'          => 'nullable|string',
            'video_url'           => 'nullable|url',
            'is_recurring'        => 'boolean',
            'recurrence_months'   => 'nullable|integer|min:1',
            'requires_assessment' => 'boolean',
            'passing_score'       => 'nullable|integer|min:0|max:100',
            'notes'               => 'nullable|string',
        ];
    }
}
