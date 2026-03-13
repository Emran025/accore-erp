<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\HumanCapital\TimeAndAttendance\Models\LeaveRequest;

class ShowLeaveRequestAction
{
    public function execute(int|string $id): array
    {
        $leaveRequest = LeaveRequest::with(['employee', 'approver', 'creator'])->findOrFail($id);
        return $leaveRequest->toArray();
    }
}
