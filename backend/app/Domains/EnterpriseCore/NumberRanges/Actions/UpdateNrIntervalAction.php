<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrInterval;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateNrIntervalAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $intervalId
    ) {}

    public function __invoke(): JsonResponse
    {
        $interval = NrInterval::findOrFail($this->intervalId);

        $this->request->validate([
            'code'        => "sometimes|string|max:20|unique:nr_intervals,code,{$this->intervalId},id,nr_object_id,{$interval->nr_object_id}",
            'description' => 'nullable|string|max:500',
            'is_external' => 'sometimes|boolean',
            'is_active'   => 'sometimes|boolean',
        ]);

        $interval->update($this->request->only(['code', 'description', 'is_external', 'is_active']));

        return $this->successResponse(['message' => 'تم تحديث نطاق الأرقام']);
    }
}
