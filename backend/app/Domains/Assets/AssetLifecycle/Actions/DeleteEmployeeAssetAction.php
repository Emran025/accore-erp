<?php

namespace App\Domains\Assets\AssetLifecycle\Actions;

use App\Domains\Assets\AssetLifecycle\Models\EmployeeAsset;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class DeleteEmployeeAssetAction
{
    public function execute(EmployeeAsset $asset): bool
    {
        PermissionService::requirePermission('employees', 'edit');

        return $asset->delete();
    }
}
