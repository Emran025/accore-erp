<?php

namespace App\Http\Requests\Finance\CurrencyPolicy;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordExchangeRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'currency_id' => 'required|exists:currencies,id',
            'target_currency_id' => 'required|exists:currencies,id|different:currency_id',
            'exchange_rate' => 'required|numeric|min:0.00000001',
            'effective_date' => 'nullable|date',
            'source' => ['nullable', Rule::in(['MANUAL', 'CENTRAL_BANK', 'API'])],
            'source_reference' => 'nullable|string|max:255',
        ];
    }
}
