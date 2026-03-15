<?php

namespace App\Http\Requests\Commercial\SalesLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class ListInvoicesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'payment_type' => 'nullable|string|in:cash,credit,bank_transfer',
            'customer_id' => 'nullable|integer|exists:ar_customers,id',
        ];
    }
}
