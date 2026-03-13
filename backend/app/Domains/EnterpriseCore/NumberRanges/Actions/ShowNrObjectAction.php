<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Services\NumberRangeService;
use Illuminate\Http\JsonResponse;

class ShowNrObjectAction extends Action
{
    public function __construct(
        private readonly int $id,
        private readonly NumberRangeService $service
    ) {}

    public function __invoke(): JsonResponse
    {
        try {
            $data = $this->service->getObjectFull($this->id);
            return $this->successResponse($data);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }
}
