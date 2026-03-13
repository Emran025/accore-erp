<?php

namespace App\Http\Requests\SupplyChain\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class DeleteCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:categories,id',
        ];
    }
}
