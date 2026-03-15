<?php

namespace App\Http\Requests\SupplyChain\SupplierSourcing;

use Illuminate\Foundation\Http\FormRequest;

class ListSuppliersRequest extends FormRequest
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
