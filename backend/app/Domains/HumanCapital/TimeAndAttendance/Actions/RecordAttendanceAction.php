<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeAndAttendance\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecordAttendanceAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly AttendanceService $attendanceService
    ) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'attendance_date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'status' => 'nullable|in:present,absent,leave,holiday,weekend',
            'notes' => 'nullable|string',
            'source' => 'nullable|string|in:manual,biometric,import'
        ]);

        try {
            $attendance = $this->attendanceService->recordAttendance(
                $validated['employee_id'],
                $validated['attendance_date'],
                $validated
            );

            return response()->json($attendance, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
