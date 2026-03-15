<?php

namespace App\Http\Requests\Intelligence\AdvancedAnalytics;

use Illuminate\Foundation\Http\FormRequest;

class GetProfitLossRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ];
    }
}
