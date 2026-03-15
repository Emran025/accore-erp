<?php

namespace App\Http\Requests\Finance\Treasury;

use Illuminate\Foundation\Http\FormRequest;

class StoreReconciliationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reconciliation_date' => 'required|date',
            'physical_balance' => 'required|numeric',
            'notes' => 'nullable|string',
            'account_code' => 'nullable|string'
        ];
    }
}
