<?php

namespace App\Http\Requests\Finance\CostProfitCenters;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfitCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'code'               => 'required|string|max:20|unique:profit_centers,code,' . $id,
            'name'               => 'required|string|max:255',
            'name_en'            => 'nullable|string|max:255',
            'parent_id'          => 'nullable|exists:profit_centers,id',
            'revenue_account_id' => 'nullable|exists:chart_of_accounts,id',
            'expense_account_id' => 'nullable|exists:chart_of_accounts,id',
            'manager_id'         => 'nullable|exists:employees,id',
            'revenue_target'     => 'nullable|numeric|min:0',
            'expense_budget'     => 'nullable|numeric|min:0',
            'type'               => 'nullable|in:business_unit,product_line,region,branch',
            'description'        => 'nullable|string',
            'is_active'          => 'nullable|boolean',
        ];
    }
}
