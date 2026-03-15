<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\LeaveRequest;
use App\Domains\HumanCapital\TimeProductivity\Services\LeaveService;

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
