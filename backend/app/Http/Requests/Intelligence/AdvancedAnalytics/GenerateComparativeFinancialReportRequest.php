<?php

namespace App\Http\Requests\Intelligence\AdvancedAnalytics;

use Illuminate\Foundation\Http\FormRequest;

class GenerateComparativeFinancialReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_start' => 'nullable|date',
            'current_end' => 'nullable|date',
            'previous_start' => 'nullable|date',
            'previous_end' => 'nullable|date',
        ];
    }
}
