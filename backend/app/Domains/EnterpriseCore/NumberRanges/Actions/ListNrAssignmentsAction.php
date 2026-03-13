<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrGroupIntervalAssignment;
use Illuminate\Http\JsonResponse;

class ListNrAssignmentsAction extends Action
{
    public function __construct(private readonly int $objectId) {}

    public function __invoke(): JsonResponse
    {
        $assignments = NrGroupIntervalAssignment::where('nr_object_id', $this->objectId)
            ->with(['group', 'interval'])
            ->orderBy('nr_group_id')
            ->get();

        return $this->successResponse(['data' => $assignments->toArray()]);
    }
}
