<?php

namespace App\Http\Requests\HumanCapital\TimeAndAttendance;

use Illuminate\Foundation\Http\FormRequest;

class SyncBiometricDeviceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'records'                     => 'nullable|array',
            'records.*.employee_code'     => 'required|string',
            'records.*.check_in'          => 'required|date',
            'records.*.check_out'         => 'nullable|date',
            'records.*.attendance_date'   => 'required|date',
        ];
    }
}
