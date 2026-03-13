<?php

namespace App\Http\Requests\SupplyChain\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit_price' => 'required|numeric|min:0',
            'minimum_profit_margin' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'unit_name' => 'nullable|string|max:50',
            'items_per_unit' => 'nullable|integer|min:1',
            'sub_unit_name' => 'nullable|string|max:50',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ];
    }
}
