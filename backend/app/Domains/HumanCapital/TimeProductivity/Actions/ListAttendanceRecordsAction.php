<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Services\AttendanceService;
use Illuminate\Database\Eloquent\Collection;

class ListAttendanceRecordsAction
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    public function execute(int $employeeId, string $startDate, string $endDate): Collection
    {
        return $this->attendanceService->getAttendanceForPeriod($employeeId, $startDate, $endDate);
    }
}
