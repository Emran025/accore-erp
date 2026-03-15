<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroupIntervalAssignment;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateNrAssignmentAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $objectId
    ) {}

    public function __invoke(): JsonResponse
    {
        NrObject::findOrFail($this->objectId);

        $this->request->validate([
            'nr_group_id'    => 'required|exists:nr_groups,id',
            'nr_interval_id' => 'required|exists:nr_intervals,id',
        ]);

        $group = NrGroup::where('id', $this->request->nr_group_id)->where('nr_object_id', $this->objectId)->first();
        $interval = NrInterval::where('id', $this->request->nr_interval_id)->where('nr_object_id', $this->objectId)->first();

        if (!$group || !$interval) {
            return $this->errorResponse('المجموعة أو النطاق لا ينتميان لنفس كائن الترقيم');
        }

        $exists = NrGroupIntervalAssignment::where('nr_group_id', $this->request->nr_group_id)
            ->where('nr_interval_id', $this->request->nr_interval_id)
            ->exists();

        if ($exists) {
            return $this->errorResponse('هذا الربط موجود بالفعل');
        }

        $assignment = NrGroupIntervalAssignment::create([
            'nr_object_id'   => $this->objectId,
            'nr_group_id'    => $this->request->nr_group_id,
            'nr_interval_id' => $this->request->nr_interval_id,
            'created_by'     => $this->request->user()?->id,
        ]);

        return $this->successResponse([
            'id'      => $assignment->id,
            'message' => 'تم الربط بنجاح',
        ]);
    }
}
