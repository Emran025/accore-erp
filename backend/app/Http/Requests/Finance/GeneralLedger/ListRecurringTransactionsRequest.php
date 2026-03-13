<?php

namespace App\Http\Requests\Finance\GeneralLedger;

use Illuminate\Foundation\Http\FormRequest;

class ListRecurringTransactionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'nullable|exists:recurring_transactions,id',
            'limit' => 'nullable|integer|min:1|max:100',
        ];
    }
}
