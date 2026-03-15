<?php

namespace App\Http\Requests\HumanCapital\PerformanceDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class StoreSuccessionPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'position_title'  => 'required|string|max:255',
            'incumbent_id'    => 'nullable|exists:employees,id',
            'readiness_level' => 'required|in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'notes'           => 'nullable|string',
        ];
    }
}
