<?php
namespace App\Domains\Finance\Taxation\Actions;

use App\Domains\Finance\Taxation\Models\TaxType;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class DeleteTaxTypeAction 
{
    public function execute(int $id): void
    {
        PermissionService::requirePermission('settings', 'delete');

        $taxType = TaxType::findOrFail($id);
        $taxType->delete();
    }
}
