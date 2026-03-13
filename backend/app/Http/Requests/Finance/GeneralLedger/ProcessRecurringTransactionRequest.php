<?php

namespace App\Http\Requests\Finance\GeneralLedger;

use Illuminate\Foundation\Http\FormRequest;

class ProcessRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template_id' => 'required|exists:recurring_transactions,id',
            'generation_date' => 'nullable|date',
        ];
    }
}
