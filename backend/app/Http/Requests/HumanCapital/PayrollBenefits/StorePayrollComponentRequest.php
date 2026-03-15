<?php

namespace App\Http\Requests\HumanCapital\PayrollBenefits;

use Illuminate\Foundation\Http\FormRequest;

class StorePayrollComponentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'component_code'   => 'required|string|max:50|unique:payroll_components,component_code',
            'component_name'   => 'required|string|max:100',
            'component_type'   => 'required|in:allowance,deduction,overtime,bonus,other',
            'calculation_type' => 'required|in:fixed,percentage,formula,attendance_based',
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
