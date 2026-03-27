<?php

namespace App\Http\Requests\Assets;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->route('id')) {
            $this->merge(['id' => $this->route('id')]);
        }
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
