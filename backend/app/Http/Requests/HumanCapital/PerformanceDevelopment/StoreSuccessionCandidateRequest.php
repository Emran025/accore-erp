<?php

namespace App\Http\Requests\HumanCapital\PerformanceDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class StoreSuccessionCandidateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'        => 'required|exists:employees,id',
            'readiness_level'    => 'required|in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'performance_rating' => 'nullable|integer|min:1|max:5',
            'potential_rating'   => 'nullable|integer|min:1|max:5',
            'development_plan'   => 'nullable|string',
            'notes'              => 'nullable|string',
        ];
    }
}
