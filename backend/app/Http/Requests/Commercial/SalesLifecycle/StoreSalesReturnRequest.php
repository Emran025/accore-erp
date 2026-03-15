<?php

namespace App\Http\Requests\Commercial\SalesLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'required|exists:invoices,id',
            'items' => 'required|array|min:1',
            'items.*.invoice_item_id' => 'required|exists:invoice_items,id',
            'items.*.return_quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:500',
        ];
    }
}
