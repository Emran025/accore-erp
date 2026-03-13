<?php

namespace App\Http\Requests\Finance\GeneralLedger;

use Illuminate\Foundation\Http\FormRequest;

class ListGlEntriesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date'     => 'nullable|date',
            'date_from'      => 'nullable|date',
            'end_date'       => 'nullable|date',
            'date_to'        => 'nullable|date',
            'voucher_number' => 'nullable|string',
            'account_code'   => 'nullable|string|exists:chart_of_accounts,account_code',
            'page'           => 'nullable|integer|min:1',
            'per_page'       => 'nullable|integer|min:1|max:100',
        ];
    }
}
