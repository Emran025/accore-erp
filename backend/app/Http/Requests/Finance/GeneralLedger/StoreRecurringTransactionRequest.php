<?php

namespace App\Http\Requests\Finance\GeneralLedger;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'frequency' => 'required|string',
            'next_due_date' => 'required|date',
            'template_data' => 'required|array',
            'action' => 'nullable|string|in:process',
        ];
    }
}
