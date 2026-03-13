<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\HumanCapital\TimeAndAttendance\Models\BiometricDevice;

class CreateBiometricDeviceAction
{
    public function execute(array $data): array
    {
        $data['created_by'] = auth()->id();
        $data['status'] = 'offline';
        $device = BiometricDevice::create($data);

        return $device->toArray();
    }
}
