<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\Revenue;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class UpdateRevenueAction
{
    public function execute(array $data): Revenue
    {
        PermissionService::requirePermission('revenues', 'edit');

        $revenue = Revenue::findOrFail($data['id']);
        $oldValues = $revenue->toArray();
        $revenue->update($data);

        TelescopeService::logOperation('UPDATE', 'revenues', $revenue->id, $oldValues, $data);

        return $revenue;
    }
}
