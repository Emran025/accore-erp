<?php

namespace App\Http\Requests\Commercial\AccountsReceivable;

use Illuminate\Foundation\Http\FormRequest;

class ListArTransactionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'nullable|exists:ar_customers,id',
            'type' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }
}
