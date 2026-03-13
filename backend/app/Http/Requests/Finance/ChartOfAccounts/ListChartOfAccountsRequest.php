<?php

namespace App\Http\Requests\Finance\ChartOfAccounts;

use Illuminate\Foundation\Http\FormRequest;

class ListChartOfAccountsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => 'nullable|string',
        ];
    }
}
