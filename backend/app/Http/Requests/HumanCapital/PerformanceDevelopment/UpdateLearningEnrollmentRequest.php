<?php

namespace App\Http\Requests\HumanCapital\PerformanceDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLearningEnrollmentRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status'              => 'in:enrolled,in_progress,completed,failed,dropped',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'score'               => 'nullable|integer|min:0|max:100',
            'completion_date'     => 'nullable|date',
        ];
    }
}
