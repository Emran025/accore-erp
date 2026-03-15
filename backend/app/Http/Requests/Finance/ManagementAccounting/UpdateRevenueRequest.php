<?php

namespace App\Http\Requests\Finance\ManagementAccounting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRevenueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:revenues,id',
            'source' => 'required|string|max:255',
            'revenue_date' => 'nullable|date',
            'description' => 'nullable|string',
        ];
    }
}
