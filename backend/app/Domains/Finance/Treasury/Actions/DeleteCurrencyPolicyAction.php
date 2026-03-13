<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;
use Illuminate\Http\JsonResponse;

class DeleteCurrencyPolicyAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $policy = CurrencyPolicy::findOrFail($this->id);

        if ($policy->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the active policy. Please activate another policy first.',
            ], 400);
        }

        if ($policy->transactionContexts()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete policy with existing transaction contexts. Historical integrity must be preserved.',
            ], 400);
        }

        $policy->delete();
        return response()->json(['success' => true, 'message' => 'Currency policy deleted successfully']);
    }
}
