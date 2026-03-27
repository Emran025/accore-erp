<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\Currency;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class ToggleCurrencyStatusAction
{
    public function execute(int $id): Currency
    {
        PermissionService::requirePermission('currency', 'edit');

        $currency = Currency::findOrFail($id);
        if ($currency->is_primary && $currency->is_active) {
            throw new \Exception('Cannot deactivate primary currency', 400);
        }
        $currency->is_active = !$currency->is_active;
        $currency->save();

        return $currency->fresh();
    }
}
