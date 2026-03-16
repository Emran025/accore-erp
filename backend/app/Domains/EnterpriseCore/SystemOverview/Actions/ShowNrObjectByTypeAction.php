<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

class ShowNrObjectByTypeAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(string $objectType): ?array
    {
        return $this->service->getObjectFullByType($objectType);
    }
}
