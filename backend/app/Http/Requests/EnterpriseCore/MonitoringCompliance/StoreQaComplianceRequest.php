<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class StoreQaComplianceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'compliance_type' => 'required|in:iso,soc,internal_audit,regulatory,other',
            'standard_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'employee_id' => 'nullable|exists:employees,id',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ];
    }
}
