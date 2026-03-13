<?php
namespace App\Domains\Finance\Currency\Actions;

use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class UpdateCurrencyAction
{
    public function execute(array $data, int $id): array
    {
        PermissionService::requirePermission('currency', 'edit');

        $currency = Currency::findOrFail($id);

        return DB::transaction(function () use ($currency, $data) {
            $currency->update([
                'code' => $data['code'],
                'name' => $data['name'],
                'symbol' => $data['symbol'],
                'exchange_rate' => $data['exchange_rate'],
                'is_active' => $data['is_active'] ?? $currency->is_active,
            ]);

            if (isset($data['denominations'])) {
                $currency->denominations()->delete();
                foreach ($data['denominations'] as $denom) {
                    $currency->denominations()->create($denom);
                }
            }

            return $currency->load('denominations')->toArray();
        });
    }
}
