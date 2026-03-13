<?php

namespace App\Http\Requests\AssetManagement;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id'                => 'required|exists:assets,id',
            'name'              => 'required|string|max:255',
            'purchase_value'    => 'required|numeric|min:0.01',
            'purchase_date'     => 'required|date',
            'depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'description'       => 'nullable|string',
            'status'            => 'nullable|in:active,disposed',
        ];
    }
}
