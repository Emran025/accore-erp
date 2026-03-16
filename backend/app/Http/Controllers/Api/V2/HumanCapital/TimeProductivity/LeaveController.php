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

    public function index(ListLeaveRequestsRequest $request, ListLeaveRequestsAction $action)
    {
        $paginated = $action->execute($request->validated());
        
        return $this->paginatedResponse(
            LeaveRequestResource::collection($paginated->items())->resolve(),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function store(StoreLeaveRequest $request, CreateLeaveRequestAction $action)
    {
        try {
            $leaveRequest = $action->execute($request->validated());
            return $this->successResponse((new LeaveRequestResource($leaveRequest))->resolve(), 'Leave request created successfully', 201);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function approve(ActionLeaveRequest $request, $id, ProcessLeaveRequestAction $action)
    {
        try {
            $leaveRequest = $action->execute($id, $request->validated());
            return $this->successResponse((new LeaveRequestResource($leaveRequest))->resolve(), 'Leave request processed successfully');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function show($id, ShowLeaveRequestAction $action)
    {
        $leaveRequest = $action->execute($id);
        return $this->successResponse((new LeaveRequestResource($leaveRequest))->resolve());
    }

    public function cancel($id, CancelLeaveRequestAction $action)
    {
        try {
            $leaveRequest = $action->execute($id);
            return $this->successResponse((new LeaveRequestResource($leaveRequest))->resolve(), 'Leave request cancelled successfully');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function myLeaveRequests(ListMyLeaveRequestsRequest $request, ListMyLeaveRequestsAction $action)
    {
        try {
            $paginated = $action->execute($request->validated());

            return $this->paginatedResponse(
                LeaveRequestResource::collection($paginated->items())->resolve(),
                $paginated->total(),
                $paginated->currentPage(),
                $paginated->perPage()
            );
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }
}
