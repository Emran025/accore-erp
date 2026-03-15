<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\CurrencyPolicy;

class ShowCurrencyPolicyAction
{
    public function execute(int $id): array
    {
        return CurrencyPolicy::findOrFail($id)->toArray();
    }
}
