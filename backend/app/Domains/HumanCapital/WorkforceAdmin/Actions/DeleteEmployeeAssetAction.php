<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Assets\AssetLifecycle\Models\EmployeeAsset;
use Illuminate\Http\JsonResponse;

class DeleteEmployeeAssetAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $asset = EmployeeAsset::findOrFail($this->id);
        $asset->delete();
        return $this->successResponse(['message' => 'Asset deleted successfully']);
    }
}
