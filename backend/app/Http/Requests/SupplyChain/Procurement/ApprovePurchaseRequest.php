<?php

namespace App\Http\Requests\SupplyChain\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class ApprovePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|integer|exists:purchases,id',
        ];
    }
}
