<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\TimeProductivity\Services\AttendanceService;
use Illuminate\Support\Collection;
class GetMyAttendanceAction
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    public function execute(string $startDate, string $endDate): Collection
    {
        $user = auth()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            throw new \Exception('Employee record not found', 404);
        }

        $records = $this->attendanceService->getAttendanceForPeriod(
            $employee->id,
            $startDate,
            $endDate
        );

        $summary = $this->attendanceService->calculateTotalHours(
            $employee->id,
            $startDate,
            $endDate
        );

        return collect([
            'records' => $records,
            'summary' => $summary
        ]);
    }
}
