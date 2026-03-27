<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\BiometricDevice;
use Illuminate\Database\Eloquent\Collection;
class ListBiometricDevicesAction
{
    public function execute(array $filters = []): Collection
    {
        $query = BiometricDevice::with('latestSync');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('device_name')->get();
    }
}
