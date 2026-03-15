<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\TimeProductivity\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class GetMyAttendanceAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly AttendanceService $attendanceService
    ) {}

    public function __invoke(): JsonResponse
    {
        PermissionService::requirePermission('portal', 'view');
        $user = auth()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee record not found'], 404);
        }

        $startDate = $this->request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $this->request->input('end_date', now()->endOfMonth()->toDateString());

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

        return response()->json([
            'records' => $records,
            'summary' => $summary
        ]);
    }
}
