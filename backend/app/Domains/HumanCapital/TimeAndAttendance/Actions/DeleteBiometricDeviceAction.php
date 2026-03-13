<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\HumanCapital\TimeAndAttendance\Models\BiometricDevice;

class DeleteBiometricDeviceAction
{
    public function execute(int|string $id): void
    {
        $device = BiometricDevice::findOrFail($id);
        $device->delete();
    }
}
