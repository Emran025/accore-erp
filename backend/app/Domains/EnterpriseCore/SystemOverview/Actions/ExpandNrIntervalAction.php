<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

class ExpandNrIntervalAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(int $intervalId, array $data, ?int $userId = null): NrInterval
    {
        return $this->service->expandInterval(
            $intervalId,
            $data['new_to'],
            $data['reason'] ?? null,
            $userId
        );
    }
}
