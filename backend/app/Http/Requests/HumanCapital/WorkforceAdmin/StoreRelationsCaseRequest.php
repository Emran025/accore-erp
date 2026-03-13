<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRelationsCaseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'           => 'required|exists:employees,id',
            'case_type'             => 'required|in:grievance,disciplinary,investigation,whistleblowing,complaint,other',
            'confidentiality_level' => 'required|in:public,confidential,highly_confidential',
            'description'           => 'required|string',
            'assigned_to'           => 'nullable|exists:users,id',
            'notes'                 => 'nullable|string',
        ];
    }
}
