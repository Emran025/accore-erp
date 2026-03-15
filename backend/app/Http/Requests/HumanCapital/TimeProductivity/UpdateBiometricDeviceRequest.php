<?php

namespace App\Http\Requests\HumanCapital\TimeProductivity;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBiometricDeviceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'device_name'   => 'sometimes|string|max:255',
            'device_ip'     => 'nullable|string|max:45',
            'device_port'   => 'nullable|integer',
            'serial_number' => 'nullable|string|max:100',
            'location'      => 'nullable|string|max:255',
            'status'        => 'sometimes|in:online,offline,maintenance,error',
            'is_active'     => 'sometimes|boolean',
        ];
    }
}
