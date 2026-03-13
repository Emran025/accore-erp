<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\HumanCapital\TimeAndAttendance\Models\LeaveRequest;
use App\Domains\HumanCapital\TimeAndAttendance\Services\LeaveService;

class ProcessLeaveRequestAction
{
    public function __construct(private readonly LeaveService $leaveService) {}

    public function execute(int|string $id, array $data): array
    {
        $leaveRequest = $this->leaveService->processLeaveRequest(
            $id,
            $data['action'],
            auth()->id(),
            $data['reason'] ?? null
        );

        return $leaveRequest->toArray();
    }
}
