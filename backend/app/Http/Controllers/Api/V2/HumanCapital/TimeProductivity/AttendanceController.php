<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeProductivity;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TimeProductivity\StoreAttendanceRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\GetAttendancePeriodRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\BulkImportAttendanceRequest;
use App\Domains\HumanCapital\TimeProductivity\Actions\ListAttendanceRecordsAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\RecordAttendanceAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\BulkImportAttendanceAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\GetAttendanceSummaryAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\GetMyAttendanceAction;
use App\Domains\HumanCapital\TimeProductivity\Models\AttendanceRecord;
use App\Http\Resources\HumanCapital\TimeProductivity\AttendanceRecordResource;
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
        
        $data = $records['data'] ?? $records;

        return $this->successResponse(AttendanceRecordResource::collection($data)->resolve());
    }

    public function store(StoreAttendanceRequest $request, RecordAttendanceAction $action)
    {
        $validated = $request->validated();

        try {
            $result = $action->execute(
                $validated['employee_id'],
                $validated['attendance_date'],
                $validated
            );
            $attendance = AttendanceRecord::findOrFail($result['id'] ?? $result);

            return $this->successResponse((new AttendanceRecordResource($attendance))->resolve(), 'Attendance record created', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function bulkImport(BulkImportAttendanceRequest $request, BulkImportAttendanceAction $action)
    {
        $validated = $request->validated();

        try {
            $imported = $action->execute($validated['records']);
            return $this->successResponse(['imported_count' => count($imported)], 'Import successful', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
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

        return $this->successResponse($summary);
    }

    public function myAttendance(Request $request, GetMyAttendanceAction $action)
    {
        try {
            $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
            $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

            $result = $action->execute($startDate, $endDate);
            $data = $result['data'] ?? $result;

            return $this->successResponse(AttendanceRecordResource::collection($data)->resolve());
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
