<?php
namespace App\Domains\Finance\CurrencyPolicy\Actions;

use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;

class ShowCurrencyPolicyAction
{
    public function execute(int $id): array
    {
        return CurrencyPolicy::findOrFail($id)->toArray();
    }
}
