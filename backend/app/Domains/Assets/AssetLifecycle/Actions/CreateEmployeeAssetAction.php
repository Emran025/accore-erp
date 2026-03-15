<?php

namespace App\Domains\Assets\AssetLifecycle\Actions;

use App\Domains\Assets\AssetLifecycle\Models\EmployeeAsset;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class CreateEmployeeAssetAction
{
    public function execute(array $data): EmployeeAsset
    {
        PermissionService::requirePermission('employees', 'edit');

        $data['status'] = $data['status'] ?? 'allocated';
        $data['created_by'] = auth()->id();

        return EmployeeAsset::create($data);
    }
}
