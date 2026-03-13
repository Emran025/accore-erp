<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Services\CurrencyPolicyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProcessCurrencyRevaluationAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'currency_id' => 'required|exists:currencies,id',
            'new_rate' => 'required|numeric|min:0.00000001',
            'fiscal_period_id' => 'nullable|exists:fiscal_periods,id',
        ]);

        try {
            $result = $this->policyService->processRevaluation(
                $validated['currency_id'],
                $validated['new_rate'],
                $validated['fiscal_period_id'] ?? null
            );
            return response()->json([
                'success' => true,
                'message' => 'Revaluation processed successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
