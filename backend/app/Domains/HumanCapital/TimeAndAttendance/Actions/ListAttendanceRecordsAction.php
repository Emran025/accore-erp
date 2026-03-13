<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeAndAttendance\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListAttendanceRecordsAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly AttendanceService $attendanceService
    ) {}

    public function __invoke(): JsonResponse
    {
        PermissionService::requirePermission('attendance', 'view');
        $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date'
        ]);

        $records = $this->attendanceService->getAttendanceForPeriod(
            $this->request->employee_id,
            $this->request->start_date,
            $this->request->end_date
        );

        return response()->json($records);
    }
}
