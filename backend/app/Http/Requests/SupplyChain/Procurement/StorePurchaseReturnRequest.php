<?php

namespace App\Http\Requests\SupplyChain\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'required|exists:purchases,id',
            'items' => 'required|array|min:1',
            'items.*.invoice_item_id' => 'required',
            'items.*.return_quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:500',
        ];
    }
}
