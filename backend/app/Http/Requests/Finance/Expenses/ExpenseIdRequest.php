<?php

namespace App\Http\Requests\Finance\Expenses;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseIdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:expenses,id',
        ];
    }
}
