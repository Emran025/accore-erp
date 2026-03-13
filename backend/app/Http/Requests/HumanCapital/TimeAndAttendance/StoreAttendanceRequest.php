<?php

namespace App\Http\Requests\HumanCapital\TimeAndAttendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'     => 'required|exists:employees,id',
            'attendance_date' => 'required|date',
            'check_in'        => 'nullable|date_format:H:i',
            'check_out'       => 'nullable|date_format:H:i|after:check_in',
            'status'          => 'nullable|in:present,absent,leave,holiday,weekend',
            'notes'           => 'nullable|string',
            'source'          => 'nullable|string|in:manual,biometric,import',
        ];
    }
}
