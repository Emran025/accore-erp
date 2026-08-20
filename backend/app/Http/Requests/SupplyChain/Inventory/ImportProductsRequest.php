<?php

namespace App\Http\Requests\SupplyChain\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class ImportProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'batch_id' => ['nullable', 'uuid'],
            'source_file' => ['nullable', 'string', 'max:255'],
            'approval_acknowledged' => ['required', 'accepted'],
            'approval_field_ids' => ['nullable', 'array'],
            'approval_field_ids.*' => ['string', 'max:100'],
            'rows' => ['required', 'array', 'min:1', 'max:1000'],
            'rows.*' => ['required', 'array'],
            'rows.*.name' => ['required', 'string', 'max:255'],
            'rows.*.description' => ['nullable', 'string'],
            'rows.*.catalog_code' => ['nullable', 'string', 'max:100'],
            'rows.*.category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'rows.*.unit_price' => ['required', 'numeric', 'min:0'],
            'rows.*.purchase_price' => ['nullable', 'numeric', 'min:0'],
            'rows.*.minimum_profit_margin' => ['nullable', 'numeric', 'min:0'],
            'rows.*.stock_quantity' => ['nullable', 'integer', 'min:0'],
            'rows.*.low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'rows.*.unit_name' => ['nullable', 'string', 'max:50'],
            'rows.*.items_per_unit' => ['nullable', 'integer', 'min:1'],
            'rows.*.sub_unit_name' => ['nullable', 'string', 'max:50'],
            'rows.*.item_type' => ['required', 'in:product,service,raw_material'],
            'rows.*.taxable' => ['nullable', 'boolean'],
            'rows.*.inventory_control' => ['nullable', 'boolean'],
            'rows.*.sellable' => ['nullable', 'boolean'],
        ];
    }
}
