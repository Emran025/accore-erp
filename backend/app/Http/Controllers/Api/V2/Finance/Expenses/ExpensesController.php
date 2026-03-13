<?php

namespace App\Http\Controllers\Api\V2\Finance\Expenses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\Expenses\StoreExpenseRequest;
use App\Http\Requests\Finance\Expenses\UpdateExpenseRequest;
use App\Http\Requests\Finance\Expenses\ExpenseIdRequest;
use App\Domains\Finance\Expenses\Actions\ListExpensesAction;
use App\Domains\Finance\Expenses\Actions\CreateExpenseAction;
use App\Domains\Finance\Expenses\Actions\UpdateExpenseAction;
use App\Domains\Finance\Expenses\Actions\DeleteExpenseAction;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\Request;

class ExpensesController extends Controller
{
    use BaseApiController;

    /**
     * Get all expenses
     */
    public function index(Request $request, ListExpensesAction $action): JsonResponse
    {
        $result = $action->execute($request->all());
        return $this->paginatedResponse(
            $result['data'],
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
            return $this->successResponse($result);
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
            $action->execute($request->validated());
            return $this->successResponse();
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
