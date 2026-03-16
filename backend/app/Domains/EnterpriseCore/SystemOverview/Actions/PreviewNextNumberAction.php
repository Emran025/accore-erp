<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

class PreviewNextNumberAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(int $objectId, int $groupId): string
    {
        return $this->service->previewNextNumber($objectId, $groupId);
    }
}
