<?php
namespace App\Domains\Assets\AssetLifecycle\Actions;

use App\Domains\Assets\AssetLifecycle\Models\Asset;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
class CreateAssetAction
{
    public function execute(array $data): Asset
    {
        PermissionService::requirePermission('assets', 'create');

        $asset = Asset::create([
            ...$data,
            'status'     => $data['status'] ?? 'active',
            'created_by' => auth()->id() ?? session('user_id')
        ]);

        TelescopeService::logOperation('CREATE', 'assets', $asset->id, null, $data);

        return $asset;
    }
}
