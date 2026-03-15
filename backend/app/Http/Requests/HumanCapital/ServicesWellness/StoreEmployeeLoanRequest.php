<?php

namespace App\Http\Requests\HumanCapital\ServicesWellness;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeLoanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'            => 'required|exists:employees,id',
            'loan_type'              => 'required|in:salary_advance,housing,car,personal,other',
            'loan_amount'            => 'required|numeric|min:0',
            'interest_rate'          => 'nullable|numeric|min:0|max:100',
            'installment_count'      => 'required|integer|min:1',
            'start_date'             => 'required|date',
            'auto_deduction'         => 'boolean',
            'deduction_component_id' => 'nullable|exists:payroll_components,id',
            'notes'                  => 'nullable|string',
        ];
    }
}
