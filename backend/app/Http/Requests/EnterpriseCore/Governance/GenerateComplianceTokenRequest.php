<?php

namespace App\Http\Requests\EnterpriseCore\Governance;

use Illuminate\Foundation\Http\FormRequest;

class GenerateComplianceTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expires_in_days' => 'nullable|integer|min:1|max:3650',
        ];
    }
}
