<?php

namespace App\Http\Requests\HumanCapital\TimeAndAttendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreBiometricDeviceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'device_name'   => 'required|string|max:255',
            'device_ip'     => 'nullable|string|max:45',
            'device_port'   => 'nullable|integer',
            'serial_number' => 'nullable|string|max:100',
            'location'      => 'nullable|string|max:255',
        ];
    }
}
