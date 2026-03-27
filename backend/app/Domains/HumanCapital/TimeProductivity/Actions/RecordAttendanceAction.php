<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Services\AttendanceService;

class RecordAttendanceAction
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    public function execute(int $employeeId, string $date, array $data): \App\Domains\HumanCapital\TimeProductivity\Models\AttendanceRecord
    {
        return $this->attendanceService->recordAttendance($employeeId, $date, $data);
    }
}
