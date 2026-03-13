<?php
namespace App\Domains\Finance\Currency\Actions;

use App\Domains\Finance\Currency\Models\Currency;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

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
