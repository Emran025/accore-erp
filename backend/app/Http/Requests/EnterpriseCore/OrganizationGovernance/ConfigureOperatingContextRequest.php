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
            'pos_terminal_id' => 'required_without:pos_terminal|nullable|exists:pos_terminals,id',
            'profit_center_id' => 'nullable|exists:profit_centers,id',
            'warehouse' => 'required_with:pos_terminal|array',
            'warehouse.code' => 'required_with:pos_terminal|string|max:30',
            'warehouse.name' => 'required_with:pos_terminal|string|max:255',
            'warehouse.name_en' => 'nullable|string|max:255',
            'warehouse.description' => 'nullable|string',
            'pos_terminal' => 'required_without:pos_terminal_id|array',
            'pos_terminal.code' => 'required_without:pos_terminal_id|string|max:30',
            'pos_terminal.name' => 'required_without:pos_terminal_id|string|max:255',
            'pos_terminal.name_en' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'org_node_uuid.required' => 'An organizational unit must be selected before configuring the operating context.',
            'cost_center_id.required' => 'An active cost center must be selected.',
            'pos_terminal_id.required_without' => 'Select an existing active POS terminal or provide a new terminal configuration.',
            'pos_terminal.required_without' => 'Select an existing active POS terminal or provide a new terminal configuration.',
        ];
    }
}
