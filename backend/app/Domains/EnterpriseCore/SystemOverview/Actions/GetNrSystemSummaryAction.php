<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

use Illuminate\Support\Collection;

class GetNrSystemSummaryAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(): Collection
    {
        return collect($this->service->getSystemSummary());
    }
}
