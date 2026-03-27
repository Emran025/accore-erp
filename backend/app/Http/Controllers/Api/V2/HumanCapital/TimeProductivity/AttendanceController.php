<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeProductivity;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TimeProductivity\StoreAttendanceRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\GetAttendancePeriodRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\BulkImportAttendanceRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\MyAttendanceRequest;
use App\Domains\HumanCapital\TimeProductivity\Actions\ListAttendanceRecordsAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\RecordAttendanceAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\BulkImportAttendanceAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\GetAttendanceSummaryAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\GetMyAttendanceAction;
use App\Http\Resources\HumanCapital\TimeProductivity\AttendanceRecordResource;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    use BaseApiController;

    public function __construct(){}

    public function index(GetAttendancePeriodRequest $request, ListAttendanceRecordsAction $action): JsonResponse
    {
        $validated = $request->validated();
        $records = $action->execute(
            $validated['employee_id'],
            $validated['start_date'],
            $validated['end_date']
        );
        
        return $this->successResponse(AttendanceRecordResource::collection($records));
    }

    public function store(StoreAttendanceRequest $request, RecordAttendanceAction $action): JsonResponse
    {
        $validated = $request->validated();

        try {
            $attendance = $action->execute(
                $validated['employee_id'],
                $validated['attendance_date'],
                $validated
            );

            return $this->successResponse(new AttendanceRecordResource($attendance), 'Attendance record created', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function bulkImport(BulkImportAttendanceRequest $request, BulkImportAttendanceAction $action): JsonResponse
    {
        try {
            $imported = $action->execute($request->validated()['records']);
            return $this->successResponse([
                'imported_count' => $imported->count()
            ], 'Import successful', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function getSummary(GetAttendancePeriodRequest $request, GetAttendanceSummaryAction $action): JsonResponse
    {
        $validated = $request->validated();

        $summary = $action->execute(
            (int) $validated['employee_id'],
            $validated['start_date'],
            $validated['end_date']
        );

        return $this->successResponse($summary);
    }

    public function myAttendance(MyAttendanceRequest $request, GetMyAttendanceAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($validated['start_date'], $validated['end_date']);
            
            return $this->successResponse([
                'records' => AttendanceRecordResource::collection($result['records']),
                'summary' => $result['summary']
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
