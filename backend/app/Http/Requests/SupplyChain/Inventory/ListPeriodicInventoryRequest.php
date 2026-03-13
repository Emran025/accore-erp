<?php

namespace App\Http\Requests\SupplyChain\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class ListPeriodicInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'period_id' => 'nullable|integer|exists:fiscal_periods,id',
        ];
    }
}
