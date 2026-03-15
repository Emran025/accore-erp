<?php

namespace App\Http\Requests\HumanCapital\PayrollBenefits;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePayrollItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'base_salary'      => 'required|numeric|min:0',
            'total_allowances' => 'required|numeric|min:0',
            'total_deductions' => 'required|numeric|min:0',
            'notes'            => 'nullable|string'
        ];
    }
}
