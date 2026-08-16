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
            'system_default' => 'sometimes|boolean',
            'cost_center_id' => 'required|exists:cost_centers,id',
            'profit_center_id' => 'required|exists:profit_centers,id',
            'warehouse' => 'required|array',
            'warehouse.code' => 'required|string|max:30',
            'warehouse.name' => 'required|string|max:255',
            'warehouse.name_en' => 'nullable|string|max:255',
            'warehouse.description' => 'nullable|string',
            'pos_terminal' => 'required|array',
            'pos_terminal.code' => 'required|string|max:30',
            'pos_terminal.name' => 'required|string|max:255',
            'pos_terminal.name_en' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'org_node_uuid.required' => 'An organizational store location must be selected.',
            'cost_center_id.required' => 'An active cost center must be selected.',
            'profit_center_id.required' => 'An active profit center must be selected.',
            'warehouse.required' => 'Warehouse configuration is required.',
            'pos_terminal.required' => 'POS terminal configuration is required.',
        ];
    }
}
