<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeProductivity;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TimeProductivity\StoreWorkforceScheduleRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\UpdateWorkforceScheduleRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\StoreScheduleShiftRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\UpdateWorkforceShiftRequest;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListSchedulesAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateScheduleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowScheduleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateScheduleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateShiftAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateShiftAction;
use App\Http\Resources\HumanCapital\TimeProductivity\WorkforceScheduleResource;
use App\Http\Resources\HumanCapital\TimeProductivity\ScheduleShiftResource;
use App\Domains\HumanCapital\TimeProductivity\Models\WorkforceSchedule;
use App\Domains\HumanCapital\TimeProductivity\Models\ScheduleShift;
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
        return $this->paginatedResponse(
            WorkforceScheduleResource::collection($result['data'] ?? $result),
            $result['total'] ?? count($result['data'] ?? $result),
            $result['current_page'] ?? 1,
            $result['per_page'] ?? 15
        );
    }

    public function store(StoreWorkforceScheduleRequest $request, CreateScheduleAction $action): JsonResponse
    {
        $schedule = $action->execute($request->validated());
        $model = WorkforceSchedule::find($schedule['id'] ?? $schedule);
        return $this->successResponse(new WorkforceScheduleResource($model), 'Schedule created successfully', 201);
    }

    public function show($id, ShowScheduleAction $action): JsonResponse
    {
        $schedule = $action->execute((int)$id);
        $model = WorkforceSchedule::find($schedule['id'] ?? $id);
        return $this->successResponse(new WorkforceScheduleResource($model));
    }

    public function update(UpdateWorkforceScheduleRequest $request, $id, UpdateScheduleAction $action): JsonResponse
    {
        $schedule = $action->execute((int)$id, $request->validated());
        $model = WorkforceSchedule::find($schedule['id'] ?? $id);
        return $this->successResponse(new WorkforceScheduleResource($model), 'Schedule updated successfully');
    }

    public function storeShift(StoreScheduleShiftRequest $request, $scheduleId, CreateShiftAction $action): JsonResponse
    {
        $shift = $action->execute((int)$scheduleId, $request->validated());
        $model = ScheduleShift::find($shift['id'] ?? $shift);
        return $this->successResponse(new ScheduleShiftResource($model), 'Shift created successfully', 201);
    }

    public function updateShift(UpdateWorkforceShiftRequest $request, $scheduleId, $shiftId, UpdateShiftAction $action): JsonResponse
    {
        $shift = $action->execute((int)$scheduleId, (int)$shiftId, $request->validated());
        $model = ScheduleShift::find($shift['id'] ?? $shiftId);
        return $this->successResponse(new ScheduleShiftResource($model), 'Shift updated successfully');
    }
}
