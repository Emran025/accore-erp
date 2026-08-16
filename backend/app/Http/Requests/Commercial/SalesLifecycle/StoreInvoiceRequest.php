<?php

namespace App\Http\Requests\Commercial\SalesLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            'invoice_number' => 'nullable|string|max:50|unique:invoices,invoice_number',
            'payment_type' => 'required|in:cash,credit',
            'customer_id' => 'required_if:payment_type,credit|nullable|exists:ar_customers,id',
            'amount_paid' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'sales_representative_id' => 'nullable|exists:sales_representatives,id',
            'operating_context_id' => 'nullable|integer|exists:operating_contexts,id',
            // Legacy identifiers are accepted only so the resolver can reject
            // mismatches. They are never trusted over the approved context.
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'pos_terminal_id' => 'nullable|exists:pos_terminals,id',
            'cost_center_id' => 'nullable|exists:cost_centers,id',
            'profit_center_id' => 'nullable|exists:profit_centers,id',
            'items.*.unit_type' => 'nullable|string|in:main,sub,piece,package',
            'vat_rate' => 'nullable|numeric|min:0|max:100',
        ];
    }
}
