<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeAndAttendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TimeAndAttendance\StoreWorkforceScheduleRequest;
use App\Http\Requests\HumanCapital\TimeAndAttendance\UpdateWorkforceScheduleRequest;
use App\Http\Requests\HumanCapital\TimeAndAttendance\StoreScheduleShiftRequest;
use App\Http\Requests\HumanCapital\TimeAndAttendance\UpdateWorkforceShiftRequest;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListSchedulesAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateScheduleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowScheduleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateScheduleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateShiftAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateShiftAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class WorkforceSchedulingController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListSchedulesAction $action): JsonResponse
    {
        $filters = $request->only(['department_id', 'status', 'schedule_date']);
        $result = $action->execute($filters);
        return $this->successResponse($result);
    }

    public function store(StoreWorkforceScheduleRequest $request, CreateScheduleAction $action): JsonResponse
    {
        $schedule = $action->execute($request->validated());
        return response()->json(array_merge(['success' => true], $schedule), 201);
    }

    public function show($id, ShowScheduleAction $action): JsonResponse
    {
        $schedule = $action->execute((int)$id);
        return $this->successResponse($schedule);
    }

    public function update(UpdateWorkforceScheduleRequest $request, $id, UpdateScheduleAction $action): JsonResponse
    {
        $schedule = $action->execute((int)$id, $request->validated());
        return $this->successResponse($schedule);
    }

    public function storeShift(StoreScheduleShiftRequest $request, $scheduleId, CreateShiftAction $action): JsonResponse
    {
        $shift = $action->execute((int)$scheduleId, $request->validated());
        return response()->json(array_merge(['success' => true], $shift), 201);
    }

    public function updateShift(UpdateWorkforceShiftRequest $request, $scheduleId, $shiftId, UpdateShiftAction $action): JsonResponse
    {
        $shift = $action->execute((int)$scheduleId, (int)$shiftId, $request->validated());
        return $this->successResponse($shift);
    }
}
