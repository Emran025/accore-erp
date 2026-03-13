<?php
namespace App\Domains\Finance\CurrencyPolicy\Actions;

use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;
use Illuminate\Support\Facades\DB;

class ActivateCurrencyPolicyAction
{
    public function execute(int $id): array
    {
        $policy = CurrencyPolicy::findOrFail($id);

        DB::transaction(function () use ($policy) {
            CurrencyPolicy::where('is_active', true)->update(['is_active' => false]);
            $policy->update(['is_active' => true]);
        });

        return [
            'message' => 'Currency policy activated successfully',
            'data' => $policy->fresh(),
        ];
    }
}
