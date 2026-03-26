<?php

namespace App\Http\Requests\Finance\Treasury;

use Illuminate\Foundation\Http\FormRequest;

class ListReconciliationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'action' => 'nullable|string|in:calculate',
            'date' => 'nullable|date',
            'account_code' => 'nullable|string|max:20',
            'status' => 'nullable|string',
        ];
    }
}
