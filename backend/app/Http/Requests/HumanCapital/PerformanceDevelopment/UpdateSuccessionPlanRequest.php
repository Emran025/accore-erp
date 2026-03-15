<?php

namespace App\Http\Requests\HumanCapital\PerformanceDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSuccessionPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'          => 'sometimes|in:active,inactive,filled',
            'readiness_level' => 'sometimes|in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'notes'           => 'nullable|string',
        ];
    }
}
