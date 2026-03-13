<?php

namespace App\Http\Requests\HumanCapital\Payroll;

use Illuminate\Foundation\Http\FormRequest;

class GeneratePayrollRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $rules = [
            'payment_nature' => 'required|string|in:salary,bonus,incentive,other',
            'period_start'   => 'nullable|date',
            'period_end'     => 'nullable|date',
            'payment_date'   => 'nullable|date',
        ];

        if ($this->payment_nature !== 'salary') {
            $rules['cycle_name']  = 'required|string|max:100';
            $rules['base_amount'] = 'required_without:individual_amounts|numeric|min:0';
        }

        return $rules;
    }
}
