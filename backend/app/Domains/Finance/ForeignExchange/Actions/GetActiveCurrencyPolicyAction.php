<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\CurrencyPolicy;

class GetActiveCurrencyPolicyAction
{
    public function execute(): ?CurrencyPolicy
    {
        return CurrencyPolicy::where('is_active', true)->first();
    }
}
