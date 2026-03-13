<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UpdateCurrencyPolicyAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $id
    ) {}

    public function __invoke(): JsonResponse
    {
        $policy = CurrencyPolicy::findOrFail($this->id);

        $validated = $this->request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('currency_policies', 'name')->ignore($this->id)],
            'code' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('currency_policies', 'code')->ignore($this->id)],
            'description' => 'nullable|string',
            'policy_type' => ['sometimes', Rule::in(['UNIT_OF_MEASURE', 'VALUED_ASSET', 'NORMALIZATION'])],
            'requires_reference_currency' => 'boolean',
            'allow_multi_currency_balances' => 'boolean',
            'conversion_timing' => ['sometimes', Rule::in(['POSTING', 'SETTLEMENT', 'REPORTING', 'NEVER'])],
            'revaluation_enabled' => 'boolean',
            'revaluation_frequency' => ['nullable', Rule::in(['DAILY', 'WEEKLY', 'MONTHLY', 'PERIOD_END'])],
            'exchange_rate_source' => ['nullable', Rule::in(['MANUAL', 'CENTRAL_BANK', 'API'])],
        ]);

        $policy->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Currency policy updated successfully',
            'data' => $policy->fresh(),
        ]);
    }
}
