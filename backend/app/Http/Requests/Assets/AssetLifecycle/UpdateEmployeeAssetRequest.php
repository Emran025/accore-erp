<?php

namespace App\Http\Requests\Assets\AssetLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeAssetRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'asset_name'    => 'sometimes|string|max:255',
            'asset_type'    => 'sometimes|in:laptop,phone,vehicle,key,equipment,other',
            'serial_number' => 'nullable|string|max:100',
            'status'        => 'sometimes|in:allocated,returned,maintenance,lost,damaged',
            'return_date'   => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'maintenance_notes'     => 'nullable|string',
            'notes'                 => 'nullable|string',
        ];
    }
}
