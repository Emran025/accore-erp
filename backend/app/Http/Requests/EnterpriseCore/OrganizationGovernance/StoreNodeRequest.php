<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class StoreNodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'node_type_id'              => 'required|string|exists:org_meta_types,id',
            'code'                      => 'required|string|max:32',
            'attributes'                => 'nullable|array',
            'status'                    => 'nullable|in:active,inactive,archived',
            'valid_from'                => 'nullable|date',
            'valid_to'                  => 'nullable|date|after_or_equal:valid_from',
            'link'                      => 'nullable|array',
            'link.target_node_uuid'     => 'nullable|uuid|exists:structure_nodes,node_uuid',
            'link.link_type'            => 'nullable|string|max:32',
            'link.validate_constraints' => 'nullable|boolean',
        ];
    }
}
