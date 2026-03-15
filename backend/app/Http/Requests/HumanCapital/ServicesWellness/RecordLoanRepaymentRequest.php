<?php

namespace App\Http\Requests\HumanCapital\ServicesWellness;

use Illuminate\Foundation\Http\FormRequest;

class RecordLoanRepaymentRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'paid_date'        => 'required|date',
            'payroll_cycle_id' => 'nullable|exists:payroll_cycles,id',
        ];
    }
}
