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
        $data = $result['data'] ?? $result;

        return $this->paginatedResponse(
            WorkforceScheduleResource::collection($data)->resolve(),
            $result['total'] ?? (is_countable($data) ? count($data) : 0),
            $result['current_page'] ?? 1,
            $result['per_page'] ?? 15
        );
    }

    public function store(StoreWorkforceScheduleRequest $request, CreateScheduleAction $action): JsonResponse
    {
        try {
            $schedule = $action->execute($request->validated());
            $model = WorkforceSchedule::findOrFail($schedule['id'] ?? $schedule);
            return $this->successResponse((new WorkforceScheduleResource($model))->resolve(), 'Schedule created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show($id, ShowScheduleAction $action): JsonResponse
    {
        $schedule = $action->execute((int)$id);
        $model = WorkforceSchedule::findOrFail($schedule['id'] ?? $id);
        return $this->successResponse((new WorkforceScheduleResource($model))->resolve());
    }

    public function update(UpdateWorkforceScheduleRequest $request, $id, UpdateScheduleAction $action): JsonResponse
    {
        try {
            $schedule = $action->execute((int)$id, $request->validated());
            $model = WorkforceSchedule::findOrFail($schedule['id'] ?? $id);
            return $this->successResponse((new WorkforceScheduleResource($model))->resolve(), 'Schedule updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function storeShift(StoreScheduleShiftRequest $request, $scheduleId, CreateShiftAction $action): JsonResponse
    {
        try {
            $shift = $action->execute((int)$scheduleId, $request->validated());
            $model = ScheduleShift::findOrFail($shift['id'] ?? $shift);
            return $this->successResponse((new ScheduleShiftResource($model))->resolve(), 'Shift created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateShift(UpdateWorkforceShiftRequest $request, $scheduleId, $shiftId, UpdateShiftAction $action): JsonResponse
    {
        try {
            $shift = $action->execute((int)$scheduleId, (int)$shiftId, $request->validated());
            $model = ScheduleShift::findOrFail($shift['id'] ?? $shiftId);
            return $this->successResponse((new ScheduleShiftResource($model))->resolve(), 'Shift updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
