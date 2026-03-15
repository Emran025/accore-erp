<?php

namespace App\Domains\Assets\AssetLifecycle\Actions;

use App\Domains\Assets\AssetLifecycle\Models\EmployeeAsset;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class UpdateEmployeeAssetAction
{
    public function execute(EmployeeAsset $asset, array $data): EmployeeAsset
    {
        PermissionService::requirePermission('employees', 'edit');

        $asset->update($data);
        return $asset;
    }
}
