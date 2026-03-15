<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroupIntervalAssignment;
use Illuminate\Http\JsonResponse;

class DeleteNrAssignmentAction extends Action
{
    public function __construct(private readonly int $assignmentId) {}

    public function __invoke(): JsonResponse
    {
        NrGroupIntervalAssignment::findOrFail($this->assignmentId)->delete();
        return $this->successResponse(['message' => 'تم حذف الربط']);
    }
}
