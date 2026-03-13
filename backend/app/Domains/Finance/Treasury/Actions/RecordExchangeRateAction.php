<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Services\CurrencyPolicyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RecordExchangeRateAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'currency_id' => 'required|exists:currencies,id',
            'target_currency_id' => 'required|exists:currencies,id|different:currency_id',
            'exchange_rate' => 'required|numeric|min:0.00000001',
            'effective_date' => 'nullable|date',
            'source' => ['nullable', Rule::in(['MANUAL', 'CENTRAL_BANK', 'API'])],
            'source_reference' => 'nullable|string|max:255',
        ]);

        try {
            $rate = $this->policyService->recordExchangeRate(
                $validated['currency_id'],
                $validated['target_currency_id'],
                $validated['exchange_rate'],
                $validated['effective_date'] ?? null,
                $validated['source'] ?? 'MANUAL',
                $validated['source_reference'] ?? null
            );
            return response()->json([
                'success' => true,
                'message' => 'Exchange rate recorded successfully',
                'data' => $rate->load(['currency', 'targetCurrency']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
