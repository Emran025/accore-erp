<?php

namespace App\Http\Requests\EnterpriseCore\Governance;

use Illuminate\Foundation\Http\FormRequest;

class StoreHealthRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'record_type' => 'required|in:vaccination,medical_exam,drug_test,health_screening,other',
            'record_date' => 'required|date',
            'expiry_date' => 'nullable|date',
            'provider_name' => 'nullable|string|max:255',
            'results' => 'nullable|string',
            'file_path' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
