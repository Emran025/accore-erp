<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class RestructureOrgLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source_node_uuid' => 'required|uuid|exists:structure_nodes,node_uuid',
            'target_node_uuid' => 'required|uuid|exists:structure_nodes,node_uuid',
            'plane_type'       => 'nullable|string|in:OPERATIONAL_HIERARCHY,LEGAL_OWNERSHIP,GEOGRAPHIC_CONTAINMENT,FUNCTIONAL_MATRIX,PROJECT_ASSIGNMENT,FINANCIAL_ROLLUP',
            'effective_date'   => 'nullable|date',
            'link_type'        => 'nullable|string|max:50',
            'reason'           => 'nullable|string|max:255',
        ];
    }
}
