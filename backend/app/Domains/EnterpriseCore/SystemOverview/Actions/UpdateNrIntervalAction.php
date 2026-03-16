<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;

class UpdateNrIntervalAction
{
    public function execute(int $intervalId, array $data): bool
    {
        $interval = NrInterval::findOrFail($intervalId);
        return $interval->update($data);
    }
}
