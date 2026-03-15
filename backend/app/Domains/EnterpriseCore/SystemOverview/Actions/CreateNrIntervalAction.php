<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateNrIntervalAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $objectId,
        private readonly NumberRangeService $service
    ) {}

    public function __invoke(): JsonResponse
    {
        $object = NrObject::findOrFail($this->objectId);

        $this->request->validate([
            'code'        => "required|string|max:20|unique:nr_intervals,code,NULL,id,nr_object_id,{$this->objectId}",
            'description' => 'nullable|string|max:500',
            'from_number' => 'required|integer|min:1',
            'to_number'   => 'required|integer|min:1',
            'is_external' => 'sometimes|boolean',
        ]);

        $error = $this->service->validateRange($object, $this->request->from_number, $this->request->to_number);
        if ($error) {
            return $this->errorResponse($error);
        }

        if ($this->service->hasOverlap($this->objectId, $this->request->from_number, $this->request->to_number)) {
            return $this->errorResponse('النطاق يتداخل مع نطاق موجود');
        }

        $interval = NrInterval::create([
            'nr_object_id' => $this->objectId,
            ...$this->request->only(['code', 'description', 'from_number', 'to_number', 'is_external']),
            'created_by' => $this->request->user()?->id,
        ]);

        return $this->successResponse([
            'id'      => $interval->id,
            'message' => 'تم إنشاء نطاق الأرقام بنجاح',
        ]);
    }
}
