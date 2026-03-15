<?php

namespace App\Http\Requests\Commercial\CRM;

use Illuminate\Foundation\Http\FormRequest;

class StoreArCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            'customer_code' => 'nullable|string|max:50|unique:ar_customers,customer_code',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'tax_number' => 'nullable|string|max:50',
            'nr_object_id' => 'nullable|integer',
            'nr_group_id' => 'nullable|integer',
        ];
    }
}
