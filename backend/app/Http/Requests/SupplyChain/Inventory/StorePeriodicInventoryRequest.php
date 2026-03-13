<?php

namespace App\Http\Requests\SupplyChain\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StorePeriodicInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'counted_quantity' => 'required|integer|min:0',
            'count_date' => 'nullable|date',
            'fiscal_period_id' => 'required|integer|exists:fiscal_periods,id',
            'notes' => 'nullable|string',
        ];
    }
}
