<?php

namespace App\Http\Requests\HumanCapital\ServicesWellness;

use Illuminate\Foundation\Http\FormRequest;

class StoreTravelExpense extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'travel_request_id' => 'nullable|exists:travel_requests,id',
            'employee_id'       => 'required|exists:employees,id',
            'expense_type'      => 'required|in:flight,hotel,meal,transportation,other',
            'expense_date'      => 'required|date',
            'amount'            => 'required|numeric|min:0',
            'currency'          => 'required|string|max:3',
            'exchange_rate'     => 'nullable|numeric|min:0',
            'receipt_path'      => 'nullable|string',
            'description'       => 'nullable|string',
            'notes'             => 'nullable|string',
        ];
    }
}
