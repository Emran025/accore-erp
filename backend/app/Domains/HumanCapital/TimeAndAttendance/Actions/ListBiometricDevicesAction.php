<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\HumanCapital\TimeAndAttendance\Models\BiometricDevice;

class ListBiometricDevicesAction
{
    public function execute(array $filters = []): array
    {
        $query = BiometricDevice::with('latestSync');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('device_name')->get()->toArray();
    }
}
