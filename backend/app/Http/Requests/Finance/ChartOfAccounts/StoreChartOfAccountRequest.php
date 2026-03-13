<?php

namespace App\Http\Requests\Finance\ChartOfAccounts;

use Illuminate\Foundation\Http\FormRequest;

class StoreChartOfAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:20|unique:chart_of_accounts,account_code',
            'name' => 'required|string|max:255',
            'type' => 'required|in:asset,liability,equity,revenue,expense',
            'parent_id' => 'nullable|integer|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
        ];
    }
}
