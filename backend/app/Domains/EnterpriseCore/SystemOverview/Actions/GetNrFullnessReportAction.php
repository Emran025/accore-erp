<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;
use Illuminate\Http\JsonResponse;

class GetNrFullnessReportAction extends Action
{
    public function __construct(
        private readonly int $objectId,
        private readonly NumberRangeService $service
    ) {}

    public function __invoke(): JsonResponse
    {
        $report = $this->service->getFullnessReport($this->objectId);
        return $this->successResponse(['data' => $report]);
    }
}
