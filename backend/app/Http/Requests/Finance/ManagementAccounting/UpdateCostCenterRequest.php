<?php

namespace App\Http\Requests\Finance\ManagementAccounting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCostCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'code'        => 'required|string|max:20|unique:cost_centers,code,' . $id,
            'name'        => 'required|string|max:255',
            'name_en'     => 'nullable|string|max:255',
            'parent_id'   => 'nullable|exists:cost_centers,id',
            'account_id'  => 'nullable|exists:chart_of_accounts,id',
            'manager_id'  => 'nullable|exists:employees,id',
            'budget'      => 'nullable|numeric|min:0',
            'type'        => 'nullable|in:operational,administrative,production,support',
            'description' => 'nullable|string',
            'is_active'   => 'nullable|boolean',
        ];
    }
}
