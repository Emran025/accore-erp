<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeProductivity\Services\AttendanceService;
use Illuminate\Support\Collection;

class GetAttendanceSummaryAction
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    public function execute(int $employeeId, string $startDate, string $endDate): Collection
    {
        $summary = $this->attendanceService->calculateTotalHours(
            $employeeId,
            $startDate,
            $endDate
        );

        return collect($summary);
    }
}
