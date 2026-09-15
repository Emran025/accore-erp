<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNodeFacetsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'facets'   => 'required|array',
            'facets.*' => 'string|in:legal_entity,cost_center,profit_center,warehouse,department,facility,sales_channel,project',
        ];
    }
}
