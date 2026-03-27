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
        $paginator = $action->execute($request->validated());
        return $this->paginatedResponse(
            ExpenseResource::collection($paginator->items())->resolve(),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    public function store(StoreExpenseRequest $request, CreateExpenseAction $action): JsonResponse
    {
        try {
            $expense = $action->execute($request->validated());
            return $this->successResponse(new ExpenseResource($expense), 'Expense recorded successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function update(UpdateExpenseRequest $request, int $id, UpdateExpenseAction $action): JsonResponse
    {
        try {
            $expense = $action->execute(array_merge($request->validated(), ['id' => $id]));
            return $this->successResponse(new ExpenseResource($expense), 'Expense updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function destroy(ExpenseIdRequest $request, int $id, DeleteExpenseAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Expense deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
