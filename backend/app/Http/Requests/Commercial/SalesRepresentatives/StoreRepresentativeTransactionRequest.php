<?php

namespace App\Http\Requests\Commercial\SalesRepresentatives;

use Illuminate\Foundation\Http\FormRequest;

class StoreRepresentativeTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sales_representative_id' => 'required|exists:sales_representatives,id',
            'type' => 'required|in:payment,adjustment',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'date' => 'nullable|date',
        ];
    }
}
