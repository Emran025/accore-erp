<?php

namespace App\Http\Requests\Finance\Currency;

use Illuminate\Foundation\Http\FormRequest;

class CurrencyIdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:currencies,id',
        ];
    }
}
