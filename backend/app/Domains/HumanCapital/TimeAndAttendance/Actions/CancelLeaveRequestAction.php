<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\HumanCapital\TimeAndAttendance\Models\LeaveRequest;
use Exception;

class CancelLeaveRequestAction
{
    public function execute(int|string $id): array
    {
        $leaveRequest = LeaveRequest::findOrFail($id);

        if ($leaveRequest->status !== 'pending') {
            throw new Exception('Only pending leave requests can be cancelled');
        }

        $leaveRequest->update(['status' => 'cancelled']);
        return $leaveRequest->toArray();
    }
}
