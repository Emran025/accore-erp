<?php

namespace App\Http\Requests\SupplyChain\PayablesExpenses;

use Illuminate\Foundation\Http\FormRequest;

class StoreApTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => 'required|exists:ap_suppliers,id',
            'type' => 'required|in:invoice,payment,return,adjustment',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'description' => 'nullable|string|max:500',
        ];
    }
}
