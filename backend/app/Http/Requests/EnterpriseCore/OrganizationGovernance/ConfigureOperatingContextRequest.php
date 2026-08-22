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
            'cost_center_id' => 'required|exists:cost_centers,id',
            'pos_terminal_id' => 'required|exists:pos_terminals,id',
            'profit_center_id' => 'prohibited',
            'warehouse' => 'prohibited',
            'pos_terminal' => 'prohibited',
        ];
    }

    public function messages(): array
    {
        return [
            'org_node_uuid.required' => 'An organizational unit must be selected before configuring the operating context.',
            'cost_center_id.required' => 'An active cost center must be selected.',
            'pos_terminal_id.required' => 'Select an existing active POS terminal already assigned to the chosen operating unit.',
            'warehouse.prohibited' => 'Create warehouses through the scoped logistics master-data workflow, not through operating-context configuration.',
            'pos_terminal.prohibited' => 'Create POS terminals through the scoped sales master-data workflow, not through operating-context configuration.',
        ];
    }
}
