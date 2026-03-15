<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\LeaveRequest;

class ShowLeaveRequestAction
{
    public function execute(int|string $id): LeaveRequest
    {
        return LeaveRequest::with(['employee', 'approver', 'creator'])->findOrFail($id);
    }
}
