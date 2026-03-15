<?php

namespace App\Http\Requests\Finance\ForeignExchange;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCurrencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'code' => 'required|string|max:3|unique:currencies,code,' . $id,
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'denominations' => 'nullable|array',
            'denominations.*.name' => 'required|string|max:100',
            'denominations.*.value' => 'required|numeric|min:0.01',
            'denominations.*.type' => 'required|in:coin,note',
        ];
    }
}
