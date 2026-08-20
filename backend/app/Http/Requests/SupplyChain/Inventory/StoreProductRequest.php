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
            'name' => 'nullable|string|max:255',
            'item_type' => 'nullable|in:product,service,raw_material',
            'taxable' => 'nullable|boolean',
            'inventory_control' => 'nullable|boolean',
            'sellable' => 'nullable|boolean',
            'name_ar' => 'nullable|string|max:255|required_without_all:name,name_en',
            'name_en' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit_price' => 'required|numeric|min:0',
            'minimum_profit_margin' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'unit_name' => 'nullable|string|max:50',
            'unit_name_ar' => 'nullable|string|max:50',
            'unit_name_en' => 'nullable|string|max:50',
            'items_per_unit' => 'nullable|integer|min:1',
            'sub_unit_name' => 'nullable|string|max:50',
            'sub_unit_name_ar' => 'nullable|string|max:50',
            'sub_unit_name_en' => 'nullable|string|max:50',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'catalog_code' => 'nullable|string|max:100|unique:products,catalog_code',
            'price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ];
    }
}
