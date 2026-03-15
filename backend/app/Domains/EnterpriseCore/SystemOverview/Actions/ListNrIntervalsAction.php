<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;
use Illuminate\Http\JsonResponse;

class ListNrIntervalsAction extends Action
{
    public function __construct(
        private readonly int $objectId,
        private readonly NumberRangeService $service
    ) {}

    public function __invoke(): JsonResponse
    {
        $intervals = NrInterval::where('nr_object_id', $this->objectId)
            ->with('groups')
            ->orderBy('from_number')
            ->get()
            ->map(function ($interval) {
                $arr = $interval->toArray();
                $arr['capacity']         = $interval->capacity;
                $arr['used']             = $interval->used;
                $arr['remaining']        = $interval->remaining;
                $arr['fullness_percent'] = $interval->fullness_percent;
                $arr['status']           = $this->service->getDomainStatus($interval->fullness_percent);
                return $arr;
            });

        return $this->successResponse(['data' => $intervals->toArray()]);
    }
}
