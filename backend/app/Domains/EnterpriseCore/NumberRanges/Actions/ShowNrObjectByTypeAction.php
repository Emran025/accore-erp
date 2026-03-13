<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Services\NumberRangeService;
use Illuminate\Http\JsonResponse;

class ShowNrObjectByTypeAction extends Action
{
    public function __construct(
        private readonly string $objectType,
        private readonly NumberRangeService $service
    ) {}

    public function __invoke(): JsonResponse
    {
        $data = $this->service->getObjectFullByType($this->objectType);
        if (!$data) {
            return $this->errorResponse('نوع الكائن غير موجود', 404);
        }
        return $this->successResponse($data);
    }
}
