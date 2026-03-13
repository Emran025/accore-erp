<?php
namespace App\Domains\Finance\CurrencyPolicy\Actions;

use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;

class DeleteCurrencyPolicyAction
{
    public function execute(int $id): void
    {
        $policy = CurrencyPolicy::findOrFail($id);

        if ($policy->is_active) {
            throw new \Exception('Cannot delete the active policy. Please activate another policy first.', 400);
        }

        // Check if policy has transactions
        if ($policy->transactionContexts()->exists()) {
            throw new \Exception('Cannot delete policy with existing transaction contexts. Historical integrity must be preserved.', 400);
        }

        $policy->delete();
    }
}
