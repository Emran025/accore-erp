<?php

namespace App\Http\Requests\Finance\GeneralLedger;

use Illuminate\Foundation\Http\FormRequest;

class DeleteRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->route('id')) {
            $this->merge(['id' => $this->route('id')]);
        }
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:recurring_transactions,id',
        ];
    }
}
