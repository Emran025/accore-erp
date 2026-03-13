<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\HumanCapital\TimeAndAttendance\Models\BiometricDevice;

class UpdateBiometricDeviceAction
{
    public function execute(int|string $id, array $data): array
    {
        $device = BiometricDevice::findOrFail($id);
        $device->update($data);

        return $device->toArray();
    }
}
