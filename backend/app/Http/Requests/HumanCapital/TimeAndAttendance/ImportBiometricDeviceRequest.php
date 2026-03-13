<?php

namespace App\Http\Requests\HumanCapital\TimeAndAttendance;

use Illuminate\Foundation\Http\FormRequest;

class ImportBiometricDeviceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'device_id' => 'required|exists:biometric_devices,id',
            'file'      => 'required|file|mimes:csv,txt,xlsx|max:10240',
        ];
    }
}
