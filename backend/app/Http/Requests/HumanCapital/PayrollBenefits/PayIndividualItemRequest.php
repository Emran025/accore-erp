<?php

namespace App\Http\Requests\HumanCapital\PayrollBenefits;

use Illuminate\Foundation\Http\FormRequest;

class PayIndividualItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'amount'     => 'required|numeric|min:0',
            'notes'      => 'nullable|string',
            'account_id' => 'nullable|exists:chart_of_accounts,id'
        ];
    }
}
