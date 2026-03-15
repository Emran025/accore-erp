<?php

namespace App\Http\Requests\Commercial\CRM;

use Illuminate\Foundation\Http\FormRequest;

class CustomerLedgerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:ar_customers,id',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'show_deleted' => 'nullable|boolean',
            'search' => 'nullable|string',
            'type' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ];
    }
}
