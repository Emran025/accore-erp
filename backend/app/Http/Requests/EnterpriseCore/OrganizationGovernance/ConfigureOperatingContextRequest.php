<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class ConfigureOperatingContextRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'org_node_uuid' => 'required|exists:structure_nodes,node_uuid',
            'cost_center_id' => 'sometimes|nullable|integer|exists:cost_centers,id',
            'profit_center_id' => 'sometimes|nullable|integer|exists:profit_centers,id',
            'warehouse_id' => 'sometimes|nullable|integer|exists:warehouses,id',
            'pos_terminal_id' => 'sometimes|nullable|integer|exists:pos_terminals,id',
            'warehouse' => 'prohibited',
            'pos_terminal' => 'prohibited',
        ];
    }

    public function messages(): array
    {
        return [
            'org_node_uuid.required' => 'An organizational unit must be selected before configuring the operating context.',
            'cost_center_id.exists' => 'Select an existing cost center.',
            'profit_center_id.exists' => 'Select an existing profit center.',
            'warehouse_id.exists' => 'Select an existing warehouse.',
            'pos_terminal_id.exists' => 'Select an existing POS terminal.',
            'warehouse.prohibited' => 'Create warehouses through the scoped logistics master-data workflow, not through operating-context configuration.',
            'pos_terminal.prohibited' => 'Create POS terminals through the scoped sales master-data workflow, not through operating-context configuration.',
        ];
    }
}
