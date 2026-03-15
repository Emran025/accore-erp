<?php

namespace App\Http\Requests\HumanCapital\PerformanceDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceGoalRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'      => 'required|exists:employees,id',
            'goal_title'       => 'required|string|max:255',
            'goal_description' => 'required|string',
            'goal_type'        => 'required|in:okr,kpi,personal,team,corporate',
            'parent_goal_id'   => 'nullable|exists:performance_goals,id',
            'target_value'     => 'nullable|numeric',
            'current_value'    => 'nullable|numeric',
            'unit'             => 'nullable|string|max:50',
            'start_date'       => 'required|date',
            'target_date'      => 'required|date|after:start_date',
            'notes'            => 'nullable|string',
        ];
    }
}
