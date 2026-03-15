<?php
namespace App\Domains\Finance\TaxCompliance\Actions;

use App\Domains\Finance\TaxCompliance\Models\TaxType;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class DeleteTaxTypeAction 
{
    public function execute(int $id): void
    {
        PermissionService::requirePermission('settings', 'delete');

        $taxType = TaxType::findOrFail($id);
        $taxType->delete();
    }
}
