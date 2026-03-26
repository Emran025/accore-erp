<?php

namespace App\Http\Controllers\Api\V2\Finance\ManagementAccounting;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ManagementAccounting\StoreExpenseRequest;
use App\Http\Requests\Finance\ManagementAccounting\UpdateExpenseRequest;
use App\Http\Requests\Finance\ManagementAccounting\ExpenseIdRequest;
use App\Domains\Finance\ManagementAccounting\Actions\ListExpensesAction;
use App\Domains\Finance\ManagementAccounting\Actions\CreateExpenseAction;
use App\Domains\Finance\ManagementAccounting\Actions\UpdateExpenseAction;
use App\Domains\Finance\ManagementAccounting\Actions\DeleteExpenseAction;
use App\Domains\Finance\ManagementAccounting\Models\Expense;
use App\Http\Requests\Finance\ManagementAccounting\ListExpensesRequest;
use App\Http\Resources\Finance\ManagementAccounting\ExpenseResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class ExpensesController extends Controller
{
    use BaseApiController;

    /**
     * Get all expenses
     */
    public function index(ListExpensesRequest $request, ListExpensesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->paginatedResponse(
            ExpenseResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    /**
     * Create a new expense
     */
    public function store(StoreExpenseRequest $request, CreateExpenseAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $expense = Expense::find($result['id'] ?? $result);
            return $this->successResponse(new ExpenseResource($expense), 'Expense recorded successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Update an expense
     */
    public function update(UpdateExpenseRequest $request, UpdateExpenseAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $expense = Expense::find($result['id'] ?? $request->input('id'));
            return $this->successResponse(new ExpenseResource($expense), 'Expense updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Delete an expense
     */
    public function destroy(ExpenseIdRequest $request, DeleteExpenseAction $action): JsonResponse
    {
        try {
            $action->execute((int)$request->input('id'));
            return $this->successResponse();
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
