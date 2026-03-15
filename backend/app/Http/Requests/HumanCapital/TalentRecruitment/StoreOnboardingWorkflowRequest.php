<?php

namespace App\Http\Requests\HumanCapital\TalentRecruitment;

use Illuminate\Foundation\Http\FormRequest;

class StoreOnboardingWorkflowRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'            => 'required|exists:employees,id',
            'workflow_type'          => 'required|in:onboarding,offboarding',
            'start_date'             => 'required|date',
            'target_completion_date' => 'nullable|date',
            'assigned_to'            => 'nullable|exists:users,id',
            'notes'                  => 'nullable|string',
        ];
    }
}
