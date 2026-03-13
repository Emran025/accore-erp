<?php

namespace App\Http\Requests\HumanCapital\Payroll;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompensationEntryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'compensation_plan_id' => 'required|exists:compensation_plans,id',
            'employee_id'          => 'required|exists:employees,id',
            'current_salary'       => 'required|numeric|min:0',
            'proposed_salary'      => 'required|numeric|min:0',
            'comp_ratio'           => 'nullable|numeric|min:0|max:2',
            'justification'        => 'nullable|string',
            'notes'                => 'nullable|string',
        ];
    }
}
