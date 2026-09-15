<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeInferenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description'       => 'nullable|string',
            'company_name'      => 'nullable|string|max:255',
            'company_code'      => 'nullable|string|max:10',
            'country_code'      => 'nullable|string|size:2',
            'currency_id'       => 'nullable|integer',
            'employee_count'    => 'nullable|integer|min:0',
            'store_count'       => 'nullable|integer|min:0',
            'warehouse_count'   => 'nullable|integer|min:0',
            'factory_count'     => 'nullable|integer|min:0',
            'has_pos'           => 'nullable|boolean',
            'has_ecommerce'     => 'nullable|boolean',
            'has_wholesale'     => 'nullable|boolean',
            'has_services'      => 'nullable|boolean',
            'has_projects'      => 'nullable|boolean',
            'has_manufacturing' => 'nullable|boolean',
            'has_matrix'        => 'nullable|boolean',
            'structured'        => 'nullable|array',
        ];
    }
}
