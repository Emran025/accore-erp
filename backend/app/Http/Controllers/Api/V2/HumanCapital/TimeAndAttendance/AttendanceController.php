<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeAndAttendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TimeAndAttendance\StoreAttendanceRequest;
use App\Http\Requests\HumanCapital\TimeAndAttendance\GetAttendancePeriodRequest;
use App\Http\Requests\HumanCapital\TimeAndAttendance\BulkImportAttendanceRequest;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\ListAttendanceRecordsAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\RecordAttendanceAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\BulkImportAttendanceAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\GetAttendanceSummaryAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\GetMyAttendanceAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class AttendanceController extends Controller
{
    use BaseApiController;

    public function __construct(){}

    public function index(GetAttendancePeriodRequest $request, ListAttendanceRecordsAction $action)
    {
        $validated = $request->validated();
        $records = $action->execute(
            $validated['employee_id'],
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json($records);
    }

    public function store(StoreAttendanceRequest $request, RecordAttendanceAction $action)
    {
        $validated = $request->validated();

        try {
            $attendance = $action->execute(
                $validated['employee_id'],
                $validated['attendance_date'],
                $validated
            );

            return response()->json($attendance, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function bulkImport(BulkImportAttendanceRequest $request, BulkImportAttendanceAction $action)
    {
        $validated = $request->validated();

        try {
            $imported = $action->execute($validated['records']);
            return response()->json(['message' => 'Import successful', 'imported' => $imported], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function getSummary(GetAttendancePeriodRequest $request, GetAttendanceSummaryAction $action)
    {
        $validated = $request->validated();

        $summary = $action->execute(
            $validated['employee_id'],
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json($summary);
    }

    public function myAttendance(Request $request, GetMyAttendanceAction $action)
    {
        try {
            $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
            $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

            $result = $action->execute($startDate, $endDate);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
