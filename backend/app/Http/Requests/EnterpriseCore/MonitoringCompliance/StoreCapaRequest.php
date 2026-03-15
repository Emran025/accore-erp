<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class StoreCapaRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'employee_id' => 'nullable|exists:employees,id',
            'type' => 'required|in:corrective,preventive',
            'issue_description' => 'required|string',
            'root_cause' => 'nullable|string',
            'action_plan' => 'nullable|string',
            'target_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ];
    }
}
