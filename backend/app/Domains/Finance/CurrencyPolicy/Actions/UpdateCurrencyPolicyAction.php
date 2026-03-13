<?php
namespace App\Domains\Finance\CurrencyPolicy\Actions;

use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;

class UpdateCurrencyPolicyAction
{
    public function execute(array $data, int $id): array
    {
        $policy = CurrencyPolicy::findOrFail($id);

        $policy->update($data);

        return $policy->fresh()->toArray();
    }
}
