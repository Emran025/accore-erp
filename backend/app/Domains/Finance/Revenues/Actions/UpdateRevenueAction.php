<?php
namespace App\Domains\Finance\Revenues\Actions;

use App\Domains\Finance\Revenues\Models\Revenue;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class UpdateRevenueAction
{
    public function execute(array $data): void
    {
        PermissionService::requirePermission('revenues', 'edit');

        $revenue = Revenue::findOrFail($data['id']);
        $oldValues = $revenue->toArray();
        $revenue->update($data);

        TelescopeService::logOperation('UPDATE', 'revenues', $revenue->id, $oldValues, $data);
    }
}
