<?php

namespace App\Http\Requests\Finance\CurrencyPolicy;

use Illuminate\Foundation\Http\FormRequest;

class ProcessRevaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'currency_id' => 'required|exists:currencies,id',
            'new_rate' => 'required|numeric|min:0.00000001',
            'fiscal_period_id' => 'nullable|exists:fiscal_periods,id',
        ];
    }
}
