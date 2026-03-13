<?php

namespace App\Http\Requests\EnterpriseCore\Governance;

use Illuminate\Foundation\Http\FormRequest;

class StorePpeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'ppe_item' => 'required|string|max:255',
            'ppe_type' => 'required|in:helmet,safety_shoes,gloves,goggles,vest,mask,other',
            'issue_date' => 'required|date',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ];
    }
}
