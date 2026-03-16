<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

class GetNrFullnessReportAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(int $objectId): array
    {
        return $this->service->getFullnessReport($objectId);
    }
}
