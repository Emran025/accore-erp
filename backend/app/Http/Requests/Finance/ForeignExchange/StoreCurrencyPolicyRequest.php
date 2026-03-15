<?php

namespace App\Http\Requests\Finance\ForeignExchange;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCurrencyPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100|unique:currency_policies,name',
            'code' => 'required|string|max:20|unique:currency_policies,code',
            'description' => 'nullable|string',
            'policy_type' => ['required', Rule::in(['UNIT_OF_MEASURE', 'VALUED_ASSET', 'NORMALIZATION'])],
            'requires_reference_currency' => 'boolean',
            'allow_multi_currency_balances' => 'boolean',
            'conversion_timing' => ['required', Rule::in(['POSTING', 'SETTLEMENT', 'REPORTING', 'NEVER'])],
            'revaluation_enabled' => 'boolean',
            'revaluation_frequency' => ['nullable', Rule::in(['DAILY', 'WEEKLY', 'MONTHLY', 'PERIOD_END'])],
            'exchange_rate_source' => ['nullable', Rule::in(['MANUAL', 'CENTRAL_BANK', 'API'])],
            'is_active' => 'boolean',
        ];
    }
}
