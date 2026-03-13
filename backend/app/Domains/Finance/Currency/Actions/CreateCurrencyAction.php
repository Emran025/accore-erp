<?php
namespace App\Domains\Finance\Currency\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

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
