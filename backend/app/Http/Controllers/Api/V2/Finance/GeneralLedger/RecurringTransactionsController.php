<?php

namespace App\Http\Controllers\Api\V2\Finance\GeneralLedger;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\GeneralLedger\ListRecurringTransactionsRequest;
use App\Http\Requests\Finance\GeneralLedger\StoreRecurringTransactionRequest;
use App\Http\Requests\Finance\GeneralLedger\UpdateRecurringTransactionRequest;
use App\Http\Requests\Finance\GeneralLedger\DeleteRecurringTransactionRequest;
use App\Http\Requests\Finance\GeneralLedger\ProcessRecurringTransactionRequest;
use App\Domains\Finance\GeneralLedger\Actions\ListRecurringTransactionsAction;
use App\Domains\Finance\GeneralLedger\Actions\CreateRecurringTransactionAction;
use App\Domains\Finance\GeneralLedger\Actions\UpdateRecurringTransactionAction;
use App\Domains\Finance\GeneralLedger\Actions\DeleteRecurringTransactionAction;
use App\Domains\Finance\GeneralLedger\Actions\ProcessRecurringTransactionAction;
use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use App\Http\Resources\Finance\Treasury\RecurringTransactionResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class RecurringTransactionsController extends Controller
{
    use BaseApiController;

    public function index(ListRecurringTransactionsRequest $request, ListRecurringTransactionsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        
        if ($result instanceof RecurringTransaction) {
            return $this->successResponse(new RecurringTransactionResource($result));
        }

        return $this->successResponse(RecurringTransactionResource::collection($result));
    }

    public function store(
        StoreRecurringTransactionRequest $request,
        CreateRecurringTransactionAction $createAction,
        ProcessRecurringTransactionAction $processAction
    ): JsonResponse {
        $validated = $request->validated();

        if ($request->query('action') === 'process') {
            $transaction = $processAction->execute($validated);
            return $this->successResponse(new RecurringTransactionResource($transaction), 'Transaction processed successfully');
        }

        $transaction = $createAction->execute($validated);
        return $this->successResponse(new RecurringTransactionResource($transaction), 'Recurring transaction created successfully', 201);
    }

    public function update(UpdateRecurringTransactionRequest $request, int $id, UpdateRecurringTransactionAction $action): JsonResponse
    {
        $transaction = $action->execute($request->validated(), $id);
        return $this->successResponse(new RecurringTransactionResource($transaction), 'Recurring transaction updated successfully');
    }

    public function destroy(DeleteRecurringTransactionRequest $request, DeleteRecurringTransactionAction $action): JsonResponse
    {
        $action->execute((int)$request->validated('id'));
        return $this->successResponse();
    }

    public function process(ProcessRecurringTransactionRequest $request, ProcessRecurringTransactionAction $action): JsonResponse
    {
        $transaction = $action->execute($request->validated());
        return $this->successResponse(new RecurringTransactionResource($transaction), 'Recurring transaction processed successfully');
    }
}
