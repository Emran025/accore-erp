<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDisciplinaryActionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'           => 'required|exists:employees,id',
            'action_type'           => 'required|in:verbal_warning,written_warning,final_warning,suspension,termination,other',
            'violation_description' => 'required|string',
            'action_taken'          => 'required|string',
            'action_date'           => 'required|date',
            'expiry_date'           => 'nullable|date',
            'notes'                 => 'nullable|string',
        ];
    }
}
