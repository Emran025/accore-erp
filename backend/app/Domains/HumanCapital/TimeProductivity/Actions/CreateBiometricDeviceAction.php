<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\BiometricDevice;

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
