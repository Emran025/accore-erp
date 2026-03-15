<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeProductivity\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetAttendanceSummaryAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly AttendanceService $attendanceService
    ) {}

    public function __invoke(): JsonResponse
    {
        $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date'
        ]);

        $summary = $this->attendanceService->calculateTotalHours(
            $this->request->employee_id,
            $this->request->start_date,
            $this->request->end_date
        );

        return response()->json($summary);
    }
}
