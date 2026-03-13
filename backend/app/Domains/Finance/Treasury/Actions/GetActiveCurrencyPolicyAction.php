<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Services\CurrencyPolicyService;
use Illuminate\Http\JsonResponse;

class GetActiveCurrencyPolicyAction extends Action
{
    public function __construct(private readonly CurrencyPolicyService $policyService) {}

    public function __invoke(): JsonResponse
    {
        $status = $this->policyService->getPolicyStatus();
        return response()->json(['success' => true, 'data' => $status]);
    }
}
