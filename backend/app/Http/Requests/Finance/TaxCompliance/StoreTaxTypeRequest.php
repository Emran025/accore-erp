<?php

namespace App\Http\Requests\Finance\TaxCompliance;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaxTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tax_authority_id' => 'required|exists:tax_authorities,id',
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:tax_types,code',
            'gl_account_code' => 'nullable|string|max:20',
            'calculation_type' => 'required|string|in:percentage,fixed_amount',
            'applicable_areas' => 'nullable|array',
            'is_active' => 'boolean',
            'rate' => 'nullable|numeric',
            'fixed_amount' => 'nullable|numeric',
        ];
    }
}
