<?php

namespace App\Http\Requests\Finance\Taxation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'name' => 'string|max:100',
            'gl_account_code' => 'nullable|string|max:20',
            'calculation_type' => 'string|in:percentage,fixed_amount',
            'applicable_areas' => 'nullable|array',
            'is_active' => 'boolean',
            'rate' => 'nullable|numeric',
            'fixed_amount' => 'nullable|numeric',
        ];
    }
}
