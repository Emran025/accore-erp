<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\CurrencyPolicy;
use Illuminate\Support\Facades\DB;

class ActivateCurrencyPolicyAction
{
    public function execute(int $id): CurrencyPolicy
    {
        $policy = CurrencyPolicy::findOrFail($id);

        return DB::transaction(function () use ($policy) {
            CurrencyPolicy::where('is_active', true)->update(['is_active' => false]);
            $policy->update(['is_active' => true]);
            return $policy->fresh();
        });
    }
}
