<?php

namespace App\Http\Requests\Commercial\RevenueReceivables;

use Illuminate\Foundation\Http\FormRequest;

class DeleteArTransactionRequest extends FormRequest
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
            'id' => 'required|integer|exists:ar_transactions,id',
        ];
    }
}
