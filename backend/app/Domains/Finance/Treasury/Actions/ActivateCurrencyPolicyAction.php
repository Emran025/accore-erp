<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;
use Illuminate\Http\JsonResponse;

class ActivateCurrencyPolicyAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $policy = CurrencyPolicy::findOrFail($this->id);
        $policy->activate();
        return response()->json([
            'success' => true,
            'message' => 'Currency policy activated successfully',
            'data' => $policy->fresh(),
        ]);
    }
}
