<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\Currency;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class DeleteCurrencyAction
{
    public function execute(int $id): void
    {
        PermissionService::requirePermission('currency', 'delete');

        $currency = Currency::findOrFail($id);
        if ($currency->is_primary) {
            throw new \Exception('Cannot delete primary currency', 400);
        }
        $currency->delete();
    }
}
