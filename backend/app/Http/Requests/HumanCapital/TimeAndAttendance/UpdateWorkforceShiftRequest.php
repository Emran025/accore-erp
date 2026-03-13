<?php

namespace App\Http\Requests\HumanCapital\TimeAndAttendance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkforceShiftRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'       => 'sometimes|in:scheduled,confirmed,swapped,cancelled,completed',
            'swapped_with' => 'nullable|exists:employees,id',
            'notes'        => 'nullable|string',
        ];
    }
}
