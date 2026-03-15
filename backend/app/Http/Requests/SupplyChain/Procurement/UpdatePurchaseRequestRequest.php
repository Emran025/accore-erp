<?php

namespace App\Http\Requests\SupplyChain\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:purchase_requests,id',
            'status' => 'required|in:approved,rejected,done',
        ];
    }
}
