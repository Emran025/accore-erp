<?php

namespace App\Http\Requests\Platform\Automation;

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
            'template_id' => 'required|integer|exists:recurring_transactions,id',
            'generation_date' => 'nullable|date',
        ];
    }
}
