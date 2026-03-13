<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CreateCurrencyPolicyAction extends Action
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
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
        ]);

        DB::beginTransaction();
        try {
            if ($validated['is_active'] ?? false) {
                CurrencyPolicy::query()->update(['is_active' => false]);
            }
            $policy = CurrencyPolicy::create($validated);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Currency policy created successfully',
                'data' => $policy,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
