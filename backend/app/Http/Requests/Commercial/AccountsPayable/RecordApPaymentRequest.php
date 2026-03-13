<?php

namespace App\Http\Requests\Commercial\AccountsPayable;

use Illuminate\Foundation\Http\FormRequest;

class RecordApPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => 'required|exists:ap_suppliers,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank,check',
            'date' => 'required|date',
            'reference' => 'nullable|string|max:100',
        ];
    }
}
