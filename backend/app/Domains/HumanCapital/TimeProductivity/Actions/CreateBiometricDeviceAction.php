<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\BiometricDevice;

class CreateBiometricDeviceAction
{
    public function execute(array $data): BiometricDevice
    {
        $data['created_by'] = auth()->id();
        $data['status'] = 'offline';
        return BiometricDevice::create($data);
    }
}
