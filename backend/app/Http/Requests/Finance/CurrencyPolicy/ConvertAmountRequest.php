<?php

namespace App\Http\Requests\Finance\CurrencyPolicy;

use Illuminate\Foundation\Http\FormRequest;

class ConvertAmountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
            'source_currency_id' => 'required|exists:currencies,id',
            'target_currency_id' => 'required|exists:currencies,id',
            'date' => 'nullable|date',
        ];
    }
}
