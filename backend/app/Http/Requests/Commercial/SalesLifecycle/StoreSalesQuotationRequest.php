<?php

namespace App\Http\Requests\Commercial\SalesLifecycle;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSalesQuotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quote_number' => ['nullable', 'string', 'max:50', Rule::unique('sales_quotations', 'quote_number')],
            'customer_id' => ['nullable', 'integer', 'exists:ar_customers,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_contact' => ['nullable', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'issue_date' => ['required', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:issue_date'],
            'currency' => ['required', 'string', 'size:3'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'scope_summary' => ['nullable', 'string', 'max:4000'],
            'payment_terms' => ['nullable', 'string', 'max:4000'],
            'terms_conditions' => ['nullable', 'string', 'max:8000'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.sku' => ['nullable', 'string', 'max:100'],
            'items.*.description' => ['required', 'string', 'max:1000'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.is_optional' => ['nullable', 'boolean'],
            'items.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
