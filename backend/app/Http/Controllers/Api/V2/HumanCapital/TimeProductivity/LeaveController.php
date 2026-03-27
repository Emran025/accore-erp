<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeProductivity;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TimeProductivity\{
    StoreLeaveRequest,
    ActionLeaveRequest,
    ListLeaveRequestsRequest,
    ListMyLeaveRequestsRequest
};
use App\Domains\HumanCapital\TimeProductivity\Actions\{
    ListLeaveRequestsAction,
    CreateLeaveRequestAction,
    ProcessLeaveRequestAction,
    ShowLeaveRequestAction,
    CancelLeaveRequestAction,
    ListMyLeaveRequestsAction
};
use App\Http\Resources\HumanCapital\TimeProductivity\LeaveRequestResource;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Exception;

class LeaveController extends Controller
{
    use BaseApiController;

    public function index(ListLeaveRequestsRequest $request, ListLeaveRequestsAction $action): \Illuminate\Http\JsonResponse
    {
        $paginator = $action->execute($request->validated());
        return $this->successResponse(LeaveRequestResource::collection($paginator));
    }

    public function store(StoreLeaveRequest $request, CreateLeaveRequestAction $action)
    {
        try {
            $leaveRequest = $action->execute($request->validated());
            return $this->successResponse(new LeaveRequestResource($leaveRequest), 'Leave request created successfully', 201);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function approve(ActionLeaveRequest $request, $id, ProcessLeaveRequestAction $action): \Illuminate\Http\JsonResponse
    {
        try {
            $leaveRequest = $action->execute($id, $request->validated());
            return $this->successResponse(new LeaveRequestResource($leaveRequest), 'Leave request processed successfully');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show($id, ShowLeaveRequestAction $action): \Illuminate\Http\JsonResponse
    {
        $leaveRequest = $action->execute($id);
        return $this->successResponse(new LeaveRequestResource($leaveRequest));
    }

    public function cancel($id, CancelLeaveRequestAction $action): \Illuminate\Http\JsonResponse
    {
        try {
            $leaveRequest = $action->execute($id);
            return $this->successResponse(new LeaveRequestResource($leaveRequest), 'Leave request cancelled successfully');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function myLeaveRequests(ListMyLeaveRequestsRequest $request, ListMyLeaveRequestsAction $action): \Illuminate\Http\JsonResponse
    {
        try {
            $paginator = $action->execute($request->validated());
            return $this->successResponse(LeaveRequestResource::collection($paginator));
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }
}
