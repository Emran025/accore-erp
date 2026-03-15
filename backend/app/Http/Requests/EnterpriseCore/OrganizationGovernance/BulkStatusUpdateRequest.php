<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class BulkStatusUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'node_uuids'   => 'required|array|min:1',
            'node_uuids.*' => 'uuid|exists:structure_nodes,node_uuid',
            'status'       => 'required|in:active,inactive,archived',
        ];
    }
}
