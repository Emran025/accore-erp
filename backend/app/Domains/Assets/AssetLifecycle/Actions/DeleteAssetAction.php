<?php
namespace App\Domains\Assets\AssetLifecycle\Actions;
use App\Domains\Assets\AssetLifecycle\Models\Asset;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
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
