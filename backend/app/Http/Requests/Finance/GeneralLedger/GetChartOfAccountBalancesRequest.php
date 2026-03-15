<?php

namespace App\Http\Requests\Finance\GeneralLedger;

use Illuminate\Foundation\Http\FormRequest;

class GetChartOfAccountBalancesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'as_of_date' => 'nullable|date',
            'account_type' => 'nullable|string|in:Asset,Liability,Equity,Revenue,Expense',
        ];
    }
}
