<?php

namespace App\Http\Requests\Commercial\AccountsReceivable;

use Illuminate\Foundation\Http\FormRequest;

class StoreArTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:ar_customers,id',
            'type' => 'required|in:payment,receipt,return',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'date' => 'nullable|date',
        ];
    }
}
