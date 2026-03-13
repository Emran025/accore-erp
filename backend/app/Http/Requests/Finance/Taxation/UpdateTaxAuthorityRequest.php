<?php

namespace App\Http\Requests\Finance\Taxation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxAuthorityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_active' => 'boolean',
            'is_primary' => 'boolean',
            'connection_type' => 'nullable|string',
            'endpoint_url' => 'nullable|string',
            'connection_credentials' => 'nullable|string',
            'config' => 'nullable|array',
        ];
    }
}
