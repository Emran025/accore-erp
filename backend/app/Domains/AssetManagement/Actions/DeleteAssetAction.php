<?php
namespace App\Domains\AssetManagement\Actions;
use App\Domains\AssetManagement\Models\Asset;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
class DeleteAssetAction
{
    public function execute(int $id): void
    {
        PermissionService::requirePermission('assets', 'delete');

        $asset = Asset::findOrFail($id);
        $oldValues = $asset->toArray();
        $asset->delete();

        TelescopeService::logOperation('DELETE', 'assets', $id, $oldValues, null);
    }
}
