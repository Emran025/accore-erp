<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\Currency;
use Illuminate\Support\Facades\DB;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class CreateCurrencyAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('currency', 'create');

        return DB::transaction(function () use ($data) {
            $currency = Currency::create([
                'code' => $data['code'],
                'name' => $data['name'],
                'symbol' => $data['symbol'],
                'exchange_rate' => $data['exchange_rate'],
                'is_active' => $data['is_active'] ?? true,
            ]);
            
            if (isset($data['denominations'])) {
                foreach ($data['denominations'] as $denom) {
                    $currency->denominations()->create($denom);
                }
            }
            
            return $currency->load('denominations')->toArray();
        });
    }
}
