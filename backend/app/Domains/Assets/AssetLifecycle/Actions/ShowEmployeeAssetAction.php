<?php

namespace App\Domains\Assets\AssetLifecycle\Actions;

use App\Domains\Assets\AssetLifecycle\Models\EmployeeAsset;

class ShowEmployeeAssetAction
{
    public function execute(int $id): EmployeeAsset
    {
        return EmployeeAsset::with(['employee', 'costCenter'])->findOrFail($id);
    }
}
