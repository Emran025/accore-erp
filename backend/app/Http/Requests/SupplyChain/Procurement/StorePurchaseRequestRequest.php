<?php

namespace App\Http\Requests\SupplyChain\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required_without:product_name|nullable|exists:products,id',
            'product_name' => 'required_without:product_id|nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'supplier_name' => 'nullable|string|max:255',
        ];
    }
}
