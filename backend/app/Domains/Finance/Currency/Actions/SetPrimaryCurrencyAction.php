<?php
namespace App\Domains\Finance\Currency\Actions;

use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

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
