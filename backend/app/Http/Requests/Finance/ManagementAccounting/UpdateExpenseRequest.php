<?php

namespace App\Http\Requests\Finance\ManagementAccounting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
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
            'id' => 'required|exists:expenses,id',
            'category' => 'required|string|max:100',
            'account_code' => 'nullable|string|max:20',
            'expense_date' => 'nullable|date',
            'description' => 'nullable|string',
        ];
    }
}
