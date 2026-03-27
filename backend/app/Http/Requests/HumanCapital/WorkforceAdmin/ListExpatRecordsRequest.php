<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class ListExpatRecordsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id'        => 'nullable|integer|exists:employees,id',
            'visa_status'        => 'nullable|string',
            'passport_status'    => 'nullable|string',
            'work_permit_status' => 'nullable|string',
        ];
    }
}
