<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class GetNodeClosuresRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plane_type' => 'nullable|string|in:OPERATIONAL_HIERARCHY,LEGAL_OWNERSHIP,GEOGRAPHIC_CONTAINMENT,FUNCTIONAL_MATRIX,PROJECT_ASSIGNMENT,FINANCIAL_ROLLUP',
        ];
    }
}
