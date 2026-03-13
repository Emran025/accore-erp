<?php

namespace App\Http\Requests\Finance\JournalVouchers;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'voucher_date'               => 'required|date',
            'description'                => 'required|string',
            'entries'                    => 'required|array|min:2',
            'entries.*.account_code'     => 'required|string',
            'entries.*.entry_type'       => 'required|in:DEBIT,CREDIT',
            'entries.*.amount'           => 'required|numeric|min:0.01',
            'entries.*.description'      => 'nullable|string',
            'entries.*.cost_center_id'   => 'nullable|exists:cost_centers,id',
            'entries.*.profit_center_id' => 'nullable|exists:profit_centers,id',
        ];
    }
}
