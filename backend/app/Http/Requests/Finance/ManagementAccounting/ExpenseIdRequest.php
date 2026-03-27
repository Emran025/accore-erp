<?php

namespace App\Http\Requests\Finance\ManagementAccounting;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseIdRequest extends FormRequest
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
        ];
    }
}
