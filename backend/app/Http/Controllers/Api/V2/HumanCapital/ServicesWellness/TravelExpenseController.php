<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\ServicesWellness;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\HumanCapital\ServicesWellness\Models\TravelRequest;
use App\Domains\HumanCapital\ServicesWellness\Models\TravelExpense;
use App\Domains\HumanCapital\ServicesWellness\Actions\{
    ListTravelRequestsAction,
    CreateTravelRequestAction,
    UpdateTravelRequestStatusAction,
    ListTravelExpensesAction,
    CreateTravelExpenseAction,
    UpdateTravelExpenseStatusAction
};
use App\Http\Requests\HumanCapital\ServicesWellness\{
    ListTravelRequestsRequest,
    StoreTravelRequest,
    UpdateTravelRequestStatusRequest,
    ListTravelExpensesRequest,
    StoreTravelExpense,
    UpdateTravelExpenseStatusRequest
};
use App\Http\Resources\HumanCapital\ServicesWellness\{
    TravelRequestResource,
    TravelExpenseResource
};
use Illuminate\Http\JsonResponse;

class TravelExpenseController extends Controller
{
    use BaseApiController;

    public function indexRequests(ListTravelRequestsRequest $request, ListTravelRequestsAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            TravelRequestResource::collection($paginated->items()),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function storeRequest(StoreTravelRequest $request, CreateTravelRequestAction $action): JsonResponse
    {
        $travelRequest = $action->execute($request->validated());

        return $this->successResponse(
            new TravelRequestResource($travelRequest->load('employee')), 
            'Travel request created successfully', 
            201
        );
    }

    public function updateRequestStatus($id, UpdateTravelRequestStatusRequest $request, UpdateTravelRequestStatusAction $action): JsonResponse
    {
        $travelRequest = TravelRequest::findOrFail($id);
        $updatedRequest = $action->execute($travelRequest, $request->validated());

        return $this->successResponse(
            new TravelRequestResource($updatedRequest->load('employee')),
            'Travel request status updated successfully'
        );
    }

    public function indexExpenses(ListTravelExpensesRequest $request, ListTravelExpensesAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            TravelExpenseResource::collection($paginated->items()),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function storeExpense(StoreTravelExpense $request, CreateTravelExpenseAction $action): JsonResponse
    {
        $expense = $action->execute($request->validated());

        return $this->successResponse(
            new TravelExpenseResource($expense->load('travelRequest', 'employee')), 
            'Travel expense recorded successfully', 
            201
        );
    }

    public function updateExpenseStatus($id, UpdateTravelExpenseStatusRequest $request, UpdateTravelExpenseStatusAction $action): JsonResponse
    {
        $expense = TravelExpense::findOrFail($id);
        $updatedExpense = $action->execute($expense, $request->validated());

        return $this->successResponse(
            new TravelExpenseResource($updatedExpense->load('travelRequest', 'employee')),
            'Travel expense status updated successfully'
        );
    }
}
