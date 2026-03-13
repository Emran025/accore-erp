<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreWellnessParticipationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'program_id'  => 'required|exists:wellness_programs,id',
            'employee_id' => 'required|exists:employees,id',
            'notes'       => 'nullable|string',
        ];
    }
}
