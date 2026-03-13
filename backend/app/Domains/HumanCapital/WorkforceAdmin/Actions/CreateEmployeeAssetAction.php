<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\AssetManagement\Models\EmployeeAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateEmployeeAssetAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'asset_code' => 'required|string|max:50|unique:employee_assets,asset_code',
            'asset_name' => 'required|string|max:255',
            'asset_type' => 'required|in:laptop,phone,vehicle,key,equipment,other',
            'serial_number' => 'nullable|string|max:100',
            'qr_code' => 'nullable|string|max:100',
            'allocation_date' => 'required|date',
            'cost_center_id' => 'nullable|exists:chart_of_accounts,id',
            'next_maintenance_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = 'allocated';
        $validated['created_by'] = auth()->id();
        $asset = EmployeeAsset::create($validated);
        
        return response()->json(array_merge(['success' => true], $asset->load('employee')->toArray()), 201);
    }
}
