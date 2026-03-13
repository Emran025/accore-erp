<?php

namespace App\Http\Requests\EnterpriseCore\OrgStructure;

use Illuminate\Foundation\Http\FormRequest;

class StoreLinkRequest extends FormRequest
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
            'link_type'        => 'nullable|string|max:32',
            'priority'         => 'nullable|integer|min:0',
            'valid_from'       => 'nullable|date',
            'valid_to'         => 'nullable|date|after_or_equal:valid_from',
        ];
    }
}
