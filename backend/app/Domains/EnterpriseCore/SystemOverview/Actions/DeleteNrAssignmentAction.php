<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroupIntervalAssignment;

class DeleteNrAssignmentAction
{
    public function execute(int $assignmentId): bool
    {
        return NrGroupIntervalAssignment::findOrFail($assignmentId)->delete();
    }
}
