<?php

namespace App\Http\Requests\SupplyChain\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'invoice_price' => 'required|numeric|min:0',
            'unit_type' => 'required|in:main,sub',
            'production_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:production_date',
            'supplier_id' => 'nullable|integer|exists:ap_suppliers,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'cost_center_id' => 'nullable|exists:cost_centers,id',
            'profit_center_id' => 'nullable|exists:profit_centers,id',
            'vat_rate' => 'nullable|numeric|min:0|max:100',
            'vat_amount' => 'nullable|numeric|min:0',
            'payment_type' => 'nullable|in:cash,credit',
            'amount_paid' => 'nullable|numeric|min:0',
            'discount_value' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:fixed,percent',
            'notes' => 'nullable|string',
        ];
    }
}
