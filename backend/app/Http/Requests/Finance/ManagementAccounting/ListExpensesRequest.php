<?php

namespace App\Http\Requests\Finance\ManagementAccounting;

use Illuminate\Foundation\Http\FormRequest;

class ListExpensesRequest extends FormRequest
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
            'category' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'cost_center_id' => 'nullable|integer',
        ];
    }
}
