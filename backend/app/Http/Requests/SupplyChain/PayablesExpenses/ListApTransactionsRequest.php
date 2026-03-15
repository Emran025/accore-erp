<?php

namespace App\Http\Requests\SupplyChain\PayablesExpenses;

use Illuminate\Foundation\Http\FormRequest;

class ListApTransactionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => 'nullable|exists:ap_suppliers,id',
            'type' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }
}
