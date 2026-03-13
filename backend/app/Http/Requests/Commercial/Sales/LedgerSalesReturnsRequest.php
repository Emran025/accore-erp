<?php

namespace App\Http\Requests\Commercial\Sales;

use Illuminate\Foundation\Http\FormRequest;

class LedgerSalesReturnsRequest extends FormRequest
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
            'search' => 'nullable|string',
            'type' => 'nullable|string|in:cash,credit',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ];
    }
}
