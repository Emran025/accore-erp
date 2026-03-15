<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\BiometricDevice;

class DeleteBiometricDeviceAction
{
    public function execute(int|string $id): void
    {
        $device = BiometricDevice::findOrFail($id);
        $device->delete();
    }
}
