<?php

namespace App\Http\Requests\HumanCapital\PayrollBenefits;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePayrollComponentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('component');
        return [
            'component_code'   => 'sometimes|string|max:50|unique:payroll_components,component_code,' . $id,
            'component_name'   => 'sometimes|string|max:100',
            'component_type'   => 'sometimes|in:allowance,deduction,overtime,bonus,other',
            'calculation_type' => 'sometimes|in:fixed,percentage,formula,attendance_based',
            'base_amount'      => 'nullable|numeric|min:0',
            'percentage'       => 'nullable|numeric|min:0|max:100',
            'formula'          => 'nullable|string',
            'is_taxable'       => 'boolean',
            'is_active'        => 'boolean',
            'display_order'    => 'integer|min:0',
            'description'      => 'nullable|string'
        ];
    }
}
