<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\Currency;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class SetPrimaryCurrencyAction
{
    public function execute(int $id): array
    {
        PermissionService::requirePermission('currency', 'edit');

        $currency = Currency::findOrFail($id);
        
        return DB::transaction(function () use ($currency) {
            Currency::where('is_primary', true)->update(['is_primary' => false]);
            $currency->is_primary = true;
            $currency->is_active = true;
            $currency->save();
            
            return [
                'message' => 'Primary currency set successfully',
                'data' => $currency->fresh()->toArray(),
            ];
        });
    }
}
