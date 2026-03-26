<?php

namespace App\Http\Requests\SupplyChain\SupplierSourcing;

use Illuminate\Foundation\Http\FormRequest;

class DeleteSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|integer|exists:ap_suppliers,id',
        ];
    }
}
