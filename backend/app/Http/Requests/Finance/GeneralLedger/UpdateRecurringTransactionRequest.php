<?php

namespace App\Http\Requests\Finance\GeneralLedger;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:recurring_transactions,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'frequency' => 'required|string',
            'next_due_date' => 'required|date',
            'template_data' => 'required|array',
        ];
    }
}
