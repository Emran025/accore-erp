<?php

namespace App\Http\Requests\HumanCapital\Payroll;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeLoanStatusRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status' => 'required|in:pending,approved,active,completed,cancelled,defaulted',
        ];
    }
}
