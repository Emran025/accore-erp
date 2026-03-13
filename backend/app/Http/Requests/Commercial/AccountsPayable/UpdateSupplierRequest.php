<?php

namespace App\Http\Requests\Commercial\AccountsPayable;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:ap_suppliers,id',
            'supplier_code' => 'nullable|string|max:50|unique:ap_suppliers,supplier_code,' . $this->id,
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'tax_number' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|integer|min:0',
        ];
    }
}
