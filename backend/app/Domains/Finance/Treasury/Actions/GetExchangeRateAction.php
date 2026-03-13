<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Services\CurrencyPolicyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetExchangeRateAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'source_currency_id' => 'required|exists:currencies,id',
            'target_currency_id' => 'required|exists:currencies,id',
            'date' => 'nullable|date',
        ]);

        $rate = $this->policyService->getExchangeRate(
            $validated['source_currency_id'],
            $validated['target_currency_id'],
            $validated['date'] ?? null
        );

        if ($rate === null) {
            return response()->json([
                'success' => false,
                'message' => 'No exchange rate available for this currency pair',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'source_currency_id' => $validated['source_currency_id'],
                'target_currency_id' => $validated['target_currency_id'],
                'rate' => $rate,
                'date' => $validated['date'] ?? now()->format('Y-m-d'),
            ],
        ]);
    }
}
