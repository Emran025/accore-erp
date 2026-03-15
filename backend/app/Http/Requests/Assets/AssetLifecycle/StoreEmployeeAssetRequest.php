<?php

namespace App\Http\Requests\Assets\AssetLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeAssetRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'asset_code'  => 'required|string|max:50|unique:employee_assets,asset_code',
            'asset_name'  => 'required|string|max:255',
            'asset_type'  => 'required|in:laptop,phone,vehicle,key,equipment,other',
            'serial_number' => 'nullable|string|max:100',
            'qr_code'       => 'nullable|string|max:100',
            'allocation_date' => 'required|date',
            'cost_center_id'  => 'nullable|exists:chart_of_accounts,id',
            'next_maintenance_date' => 'nullable|date',
            'notes'           => 'nullable|string',
        ];
    }
}
