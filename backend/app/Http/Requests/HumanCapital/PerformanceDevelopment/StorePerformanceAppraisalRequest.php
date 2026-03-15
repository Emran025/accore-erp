<?php

namespace App\Http\Requests\HumanCapital\PerformanceDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceAppraisalRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'      => 'required|exists:employees,id',
            'appraisal_type'   => 'required|in:self,manager,peer,360,annual,mid_year',
            'appraisal_period' => 'required|string|max:50',
            'appraisal_date'   => 'required|date',
            'manager_id'       => 'nullable|exists:employees,id',
            'ratings'          => 'nullable|array',
            'notes'            => 'nullable|string',
        ];
    }
}
