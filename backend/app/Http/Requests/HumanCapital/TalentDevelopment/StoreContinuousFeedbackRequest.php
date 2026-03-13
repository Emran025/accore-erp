<?php

namespace App\Http\Requests\HumanCapital\TalentDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class StoreContinuousFeedbackRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'            => 'required|exists:employees,id',
            'feedback_type'          => 'required|in:check_in,praise,improvement,coaching,other',
            'feedback_content'       => 'required|string',
            'feedback_date'          => 'required|date',
            'is_visible_to_employee' => 'boolean',
            'notes'                  => 'nullable|string',
        ];
    }
}
