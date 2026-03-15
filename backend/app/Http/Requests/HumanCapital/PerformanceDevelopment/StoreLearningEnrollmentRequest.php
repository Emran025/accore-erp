<?php

namespace App\Http\Requests\HumanCapital\PerformanceDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class StoreLearningEnrollmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_id'       => 'required|exists:learning_courses,id',
            'employee_id'     => 'required|exists:employees,id',
            'enrollment_type' => 'required|in:assigned,self_enrolled,mandatory',
            'due_date'        => 'nullable|date',
            'notes'           => 'nullable|string',
        ];
    }
}
