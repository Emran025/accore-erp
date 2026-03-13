<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\AssetManagement\Models\EmployeeAsset;
use Illuminate\Http\JsonResponse;

class ShowEmployeeAssetAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $asset = EmployeeAsset::with(['employee', 'costCenter'])->findOrFail($this->id);
        return $this->successResponse($asset->toArray());
    }
}
