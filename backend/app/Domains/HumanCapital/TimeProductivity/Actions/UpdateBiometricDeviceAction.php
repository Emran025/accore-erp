<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\BiometricDevice;

class UpdateBiometricDeviceAction
{
    public function execute(int|string $id, array $data): BiometricDevice
    {
        $device = BiometricDevice::findOrFail($id);
        $device->update($data);

        return $device;
    }
}
