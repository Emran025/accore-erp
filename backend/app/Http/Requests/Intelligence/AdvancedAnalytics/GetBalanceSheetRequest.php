<?php

namespace App\Http\Requests\Intelligence\AdvancedAnalytics;

use Illuminate\Foundation\Http\FormRequest;

class GetBalanceSheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'as_of_date' => 'nullable|date',
        ];
    }
}
