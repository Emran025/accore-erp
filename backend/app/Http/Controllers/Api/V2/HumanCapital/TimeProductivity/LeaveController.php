<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeProductivity;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\TimeProductivity\Services\LeaveService;
use App\Domains\HumanCapital\TimeProductivity\Models\LeaveRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\StoreLeaveRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\ActionLeaveRequest;
use App\Domains\HumanCapital\TimeProductivity\Actions\ListLeaveRequestsAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\CreateLeaveRequestAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\ProcessLeaveRequestAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\ShowLeaveRequestAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\CancelLeaveRequestAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\ListMyLeaveRequestsAction;
use Illuminate\Http\Request;
use Exception;

class LeaveController extends Controller
{
    public function __construct()
    {
    }

    public function index(Request $request, ListLeaveRequestsAction $action)
    {
        $filters = $request->only(['employee_id', 'status', 'start_date', 'end_date']);
        $requests = $action->execute($filters);

        return response()->json($requests);
    }

    public function store(StoreLeaveRequest $request, CreateLeaveRequestAction $action)
    {
        $validated = $request->validated();

        try {
            $leaveRequest = $action->execute($validated);
            return response()->json($leaveRequest, 201);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function approve(ActionLeaveRequest $request, $id, ProcessLeaveRequestAction $action)
    {
        $validated = $request->validated();

        try {
            $leaveRequest = $action->execute($id, $validated);
            return response()->json($leaveRequest);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function show($id, ShowLeaveRequestAction $action)
    {
        $leaveRequest = $action->execute($id);
        return response()->json($leaveRequest);
    }

    public function cancel($id, CancelLeaveRequestAction $action)
    {
        try {
            $leaveRequest = $action->execute($id);
            return response()->json($leaveRequest);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function myLeaveRequests(Request $request, ListMyLeaveRequestsAction $action)
    {
        try {
            $filters = $request->only(['status']);
            $requests = $action->execute($filters);

            return response()->json($requests);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }
}
