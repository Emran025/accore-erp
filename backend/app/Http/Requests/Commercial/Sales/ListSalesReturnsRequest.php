<?php

namespace App\Http\Requests\Commercial\Sales;

use Illuminate\Foundation\Http\FormRequest;

class ListSalesReturnsRequest extends FormRequest
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
            'invoice_id' => 'nullable|integer|exists:invoices,id',
        ];
    }
}
