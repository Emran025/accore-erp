<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;
use Illuminate\Http\JsonResponse;

class GetNrSystemSummaryAction extends Action
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function __invoke(): JsonResponse
    {
        $summary = $this->service->getSystemSummary();
        return $this->successResponse(['data' => $summary]);
    }
}
