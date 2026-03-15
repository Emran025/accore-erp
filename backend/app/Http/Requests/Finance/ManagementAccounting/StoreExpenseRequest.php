<?php

namespace App\Http\Requests\Finance\ManagementAccounting;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => 'required|string|max:100',
            'account_code' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'nullable|date',
            'description' => 'nullable|string',
            'payment_type' => 'nullable|in:cash,credit',
            'supplier_id' => 'nullable|exists:ap_suppliers,id',
        ];
    }
}
