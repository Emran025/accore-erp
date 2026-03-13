<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Services\NumberRangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpandNrIntervalAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $intervalId,
        private readonly NumberRangeService $service
    ) {}

    public function __invoke(): JsonResponse
    {
        $this->request->validate([
            'new_to' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $interval = $this->service->expandInterval(
                $this->intervalId,
                $this->request->new_to,
                $this->request->reason,
                $this->request->user() ? $this->request->user()->id : null
            );

            $intervalData = $interval->toArray();
            $intervalData['capacity'] = $interval->capacity;
            $intervalData['remaining'] = $interval->remaining;
            $intervalData['fullness_percent'] = $interval->fullness_percent;

            return $this->successResponse([
                'message' => 'تم توسيع النطاق بنجاح',
                'interval' => $intervalData,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }
}
