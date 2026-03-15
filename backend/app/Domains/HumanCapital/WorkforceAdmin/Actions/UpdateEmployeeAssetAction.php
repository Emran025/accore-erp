<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Assets\AssetLifecycle\Models\EmployeeAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateEmployeeAssetAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $asset = EmployeeAsset::findOrFail($this->id);
        
        $validated = $this->request->validate([
            'asset_name' => 'string|max:255',
            'asset_type' => 'in:laptop,phone,vehicle,key,equipment,other',
            'serial_number' => 'nullable|string|max:100',
            'status' => 'in:allocated,returned,maintenance,lost,damaged',
            'return_date' => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'maintenance_notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $asset->update($validated);
        return $this->successResponse($asset->load('employee', 'costCenter')->toArray());
    }
}
