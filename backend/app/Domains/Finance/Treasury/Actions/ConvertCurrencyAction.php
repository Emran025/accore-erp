<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Services\CurrencyPolicyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ConvertCurrencyAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function __invoke(): JsonResponse
    {
        PermissionService::requirePermission('currency', 'edit');
        $validated = $this->request->validate([
            'amount' => 'required|numeric|min:0',
            'source_currency_id' => 'required|exists:currencies,id',
            'target_currency_id' => 'required|exists:currencies,id',
            'date' => 'nullable|date',
        ]);

        try {
            $result = $this->policyService->convert(
                $validated['amount'],
                $validated['source_currency_id'],
                $validated['target_currency_id'],
                $validated['date'] ?? null
            );
            return response()->json([
                'success' => true,
                'data' => [
                    'original_amount' => $validated['amount'],
                    'converted_amount' => $result['amount'],
                    'exchange_rate' => $result['rate'],
                    'source_currency_id' => $validated['source_currency_id'],
                    'target_currency_id' => $validated['target_currency_id'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
