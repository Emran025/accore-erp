<?php

namespace App\Http\Requests\Commercial\SalesLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                   => 'required|string|max:255',
            'description'            => 'nullable|string',
            'category_id'            => 'nullable|integer|exists:categories,id',
            'unit_price'             => 'required|numeric|min:0',
            'minimum_profit_margin'  => 'nullable|numeric|min:0',
            'taxable'                => 'boolean',
            'unit_name'              => 'nullable|string|max:50',
            'sub_unit_name'          => 'nullable|string|max:50',
            'pos_locations'          => 'nullable|array',
            'pos_locations.*.pos_location'   => 'required|string|max:100',
            'pos_locations.*.active'         => 'boolean',
            'pos_locations.*.effective_from' => 'nullable|date',
            'pos_locations.*.effective_to'   => 'nullable|date',
            'pos_locations.*.notes'          => 'nullable|string',
        ];
    }
}
