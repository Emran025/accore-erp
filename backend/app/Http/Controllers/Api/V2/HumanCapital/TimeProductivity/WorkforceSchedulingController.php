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
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class WorkforceSchedulingController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListSchedulesAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(WorkforceScheduleResource::collection($paginator));
    }

    public function store(StoreWorkforceScheduleRequest $request, CreateScheduleAction $action): JsonResponse
    {
        try {
            $schedule = $action->execute($request->validated());
            return $this->successResponse(new WorkforceScheduleResource($schedule), 'Schedule created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show($id, ShowScheduleAction $action): JsonResponse
    {
        $schedule = $action->execute((int)$id);
        return $this->successResponse(new WorkforceScheduleResource($schedule));
    }

    public function update(UpdateWorkforceScheduleRequest $request, $id, UpdateScheduleAction $action): JsonResponse
    {
        try {
            $schedule = $action->execute((int)$id, $request->validated());
            return $this->successResponse(new WorkforceScheduleResource($schedule), 'Schedule updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function storeShift(StoreScheduleShiftRequest $request, $scheduleId, CreateShiftAction $action): JsonResponse
    {
        try {
            $shift = $action->execute((int)$scheduleId, $request->validated());
            return $this->successResponse(new ScheduleShiftResource($shift), 'Shift created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateShift(UpdateWorkforceShiftRequest $request, $scheduleId, $shiftId, UpdateShiftAction $action): JsonResponse
    {
        try {
            $shift = $action->execute((int)$scheduleId, (int)$shiftId, $request->validated());
            return $this->successResponse(new ScheduleShiftResource($shift), 'Shift updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
