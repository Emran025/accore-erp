<?php

namespace App\Http\Requests\Commercial\AccountsPayable;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:ap_transactions,id',
            'description' => 'nullable|string|max:500',
            'transaction_date' => 'nullable|date',
            'is_deleted' => 'nullable|boolean',
        ];
    }
}
