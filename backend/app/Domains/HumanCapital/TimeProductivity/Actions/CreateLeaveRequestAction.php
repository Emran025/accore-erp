<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Services\LeaveService;

class CreateLeaveRequestAction
{
    public function __construct(private readonly LeaveService $leaveService) {}

    public function execute(array $data): array
    {
        $leaveRequest = $this->leaveService->createLeaveRequest(
            $data['employee_id'],
            $data
        );

        return current($leaveRequest->toArray()) ?: $leaveRequest->toArray();
    }
}
