<?php

namespace App\Http\Requests\Commercial\Purchases;

use Illuminate\Foundation\Http\FormRequest;

class ListPurchasesRequest extends FormRequest
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
            'search' => 'nullable|string',
        ];
    }
}
