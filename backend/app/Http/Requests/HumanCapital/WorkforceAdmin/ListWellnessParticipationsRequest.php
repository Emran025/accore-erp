<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class ListWellnessParticipationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id'  => 'nullable|integer|exists:wellness_programs,id',
            'employee_id' => 'nullable|integer|exists:employees,id',
            'status'      => 'nullable|string',
        ];
    }
}
