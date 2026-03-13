<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreContingentContractRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'contract_start_date' => 'required|date',
            'contract_end_date'   => 'nullable|date',
            'contract_terms'      => 'nullable|string',
            'file_path'           => 'nullable|string',
            'total_value'         => 'nullable|numeric|min:0',
        ];
    }
}
