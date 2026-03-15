<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class ValidateComplianceStructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'format'    => 'required|in:json,xml,yml',
            'structure' => 'required|string',
        ];
    }
}
