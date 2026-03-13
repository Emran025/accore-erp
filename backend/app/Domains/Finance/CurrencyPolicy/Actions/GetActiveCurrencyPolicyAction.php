<?php
namespace App\Domains\Finance\CurrencyPolicy\Actions;

use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;

class GetActiveCurrencyPolicyAction
{
    public function execute(): array
    {
        return CurrencyPolicy::where('is_active', true)->first()?->toArray() ?? [];
    }
}
