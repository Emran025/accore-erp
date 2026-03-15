<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\CurrencyPolicy;

class UpdateCurrencyPolicyAction
{
    public function execute(array $data, int $id): array
    {
        $policy = CurrencyPolicy::findOrFail($id);

        $policy->update($data);

        return $policy->fresh()->toArray();
    }
}
