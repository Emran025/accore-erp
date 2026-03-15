<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Services\LeaveService;
use App\Domains\HumanCapital\TimeProductivity\Models\LeaveRequest;

class CreateLeaveRequestAction
{
    public function __construct(private readonly LeaveService $leaveService) {}

    public function execute(array $data): LeaveRequest
    {
        return $this->leaveService->createLeaveRequest(
            $data['employee_id'],
            $data
        );
    }
}
