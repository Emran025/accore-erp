<?php

namespace App\Http\Requests\Finance\Treasury;

use Illuminate\Foundation\Http\FormRequest;

class ListCurrencyPositionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'currency_id' => 'nullable|exists:currencies,id',
            'as_of_date'  => 'nullable|date',
        ];
    }
}

