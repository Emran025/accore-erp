<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Services\NumberRangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetNextNumberAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly NumberRangeService $service
    ) {}

    public function __invoke(): JsonResponse
    {
        $this->request->validate([
            'object_id' => 'required|exists:nr_objects,id',
            'group_id'  => 'required|exists:nr_groups,id',
        ]);

        try {
            $number = $this->service->getNextNumber(
                $this->request->object_id,
                $this->request->group_id
            );
            return $this->successResponse([
                'number'  => $number,
                'message' => 'تم توليد الرقم بنجاح',
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }
}
