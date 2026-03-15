<?php

namespace App\Http\Requests\Finance\ForeignExchange;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCurrencyPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('currency_policies', 'name')->ignore($id)],
            'code' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('currency_policies', 'code')->ignore($id)],
            'description' => 'nullable|string',
            'policy_type' => ['sometimes', Rule::in(['UNIT_OF_MEASURE', 'VALUED_ASSET', 'NORMALIZATION'])],
            'requires_reference_currency' => 'boolean',
            'allow_multi_currency_balances' => 'boolean',
            'conversion_timing' => ['sometimes', Rule::in(['POSTING', 'SETTLEMENT', 'REPORTING', 'NEVER'])],
            'revaluation_enabled' => 'boolean',
            'revaluation_frequency' => ['nullable', Rule::in(['DAILY', 'WEEKLY', 'MONTHLY', 'PERIOD_END'])],
            'exchange_rate_source' => ['nullable', Rule::in(['MANUAL', 'CENTRAL_BANK', 'API'])],
        ];
    }
}
