<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\CurrencyPolicy;

use Illuminate\Support\Facades\DB;

class CreateCurrencyPolicyAction
{
    public function execute(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // If setting as active, deactivate others
            if ($data['is_active'] ?? false) {
                CurrencyPolicy::query()->update(['is_active' => false]);
            }

            $policy = CurrencyPolicy::create([
                'name' => $data['name'],
                'code' => $data['code'],
                'description' => $data['description'] ?? null,
                'policy_type' => $data['policy_type'],
                'requires_reference_currency' => $data['requires_reference_currency'] ?? false,
                'allow_multi_currency_balances' => $data['allow_multi_currency_balances'] ?? false,
                'conversion_timing' => $data['conversion_timing'],
                'revaluation_enabled' => $data['revaluation_enabled'] ?? false,
                'revaluation_frequency' => $data['revaluation_frequency'] ?? null,
                'exchange_rate_source' => $data['exchange_rate_source'] ?? 'MANUAL',
                'is_active' => $data['is_active'] ?? false,
                'created_by' => auth()->id() ?? session('user_id'),
            ]);

            return $policy->toArray();
        });
    }
}
