<?php

namespace App\Http\Requests\HumanCapital\TalentDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerformanceGoalRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'goal_title'          => 'sometimes|string|max:255',
            'goal_description'    => 'sometimes|string',
            'status'              => 'sometimes|in:not_started,in_progress,on_track,at_risk,completed,cancelled',
            'target_value'        => 'nullable|numeric',
            'current_value'       => 'nullable|numeric',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'notes'               => 'nullable|string',
        ];
    }
}
