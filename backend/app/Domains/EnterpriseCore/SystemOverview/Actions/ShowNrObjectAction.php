<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

class ShowNrObjectAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(int $id): NrObject
    {
        return $this->service->getObjectFull($id);
    }
}
