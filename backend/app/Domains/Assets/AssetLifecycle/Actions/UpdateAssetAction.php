<?php
namespace App\Domains\Assets\AssetLifecycle\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Assets\AssetLifecycle\Models\Asset;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
class UpdateAssetAction
{
    public function execute(array $data): void
    {
        PermissionService::requirePermission('assets', 'edit');

        $asset = Asset::findOrFail($data['id']);
        $oldValues = $asset->toArray();
        $asset->update($data);

        TelescopeService::logOperation('UPDATE', 'assets', $asset->id, $oldValues, $data);
    }
}
