<?php

namespace App\Http\Requests\Intelligence\BusinessIntelligence;

use Illuminate\Foundation\Http\FormRequest;

class ShowExecutiveDashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'detail' => 'nullable|string|in:low_stock,expiring_soon',
        ];
    }
}
