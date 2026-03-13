<?php
namespace App\Domains\AssetManagement\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\AssetManagement\Models\Asset;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
class CreateAssetAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('assets', 'create');

        $asset = Asset::create([
            ...$data,
            'status'     => $data['status'] ?? 'active',
            'created_by' => auth()->id() ?? session('user_id')
        ]);

        TelescopeService::logOperation('CREATE', 'assets', $asset->id, null, $data);

        return ['id' => $asset->id];
    }
}
