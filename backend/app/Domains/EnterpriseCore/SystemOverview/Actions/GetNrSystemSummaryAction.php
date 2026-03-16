<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

class GetNrSystemSummaryAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(): array
    {
        return $this->service->getSystemSummary();
    }
}
