<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

use Illuminate\Support\Collection;

class GetNrFullnessReportAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(int $objectId): Collection
    {
        return collect($this->service->getFullnessReport($objectId));
    }
}
