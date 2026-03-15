<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\BiometricSyncLog;

class GetBiometricSyncLogsAction
{
    public function execute(array $filters = []): array
    {
        $query = BiometricSyncLog::with(['device', 'initiator']);

        if (!empty($filters['device_id'])) {
            $query->where('device_id', $filters['device_id']);
        }

        return $query->orderByDesc('created_at')->paginate(20)->toArray();
    }
}
