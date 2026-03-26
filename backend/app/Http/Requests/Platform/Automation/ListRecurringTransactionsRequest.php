<?php

namespace App\Http\Requests\Platform\Automation;

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
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,paused,completed',
            'frequency' => 'nullable|string',
        ];
    }
}
