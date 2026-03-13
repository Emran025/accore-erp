<?php

namespace App\Http\Requests\Finance\GeneralLedger;

use Illuminate\Foundation\Http\FormRequest;

class AccountDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_code' => 'required_without:account_id|string|exists:chart_of_accounts,account_code',
            'account_id'   => 'required_without:account_code|integer|exists:chart_of_accounts,id',
            'start_date'   => 'nullable|date',
            'date_from'    => 'nullable|date',
            'end_date'     => 'nullable|date',
            'date_to'      => 'nullable|date',
            'page'         => 'nullable|integer|min:1',
            'per_page'     => 'nullable|integer|min:1|max:100',
        ];
    }
}
