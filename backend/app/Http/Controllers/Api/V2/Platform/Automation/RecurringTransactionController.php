<?php

namespace App\Http\Controllers\Api\V2\Platform\Automation;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\EnterpriseCore\Automation\Actions\ListRecurringTransactionsAction;
use App\Domains\EnterpriseCore\Automation\Actions\CreateRecurringTransactionAction;
use App\Domains\EnterpriseCore\Automation\Actions\UpdateRecurringTransactionAction;
use App\Domains\EnterpriseCore\Automation\Actions\DeleteRecurringTransactionAction;
use App\Domains\EnterpriseCore\Automation\Actions\ProcessRecurringTransactionAction;
use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use App\Http\Resources\Finance\Treasury\RecurringTransactionResource;
use Illuminate\Http\JsonResponse;

use App\Http\Requests\Platform\Automation\ListRecurringTransactionsRequest;
use App\Http\Requests\Platform\Automation\StoreRecurringTransactionRequest;
use App\Http\Requests\Platform\Automation\ProcessRecurringTransactionRequest;

class RecurringTransactionController extends Controller
{
    use BaseApiController;

    public function index(ListRecurringTransactionsRequest $request, ListRecurringTransactionsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->paginatedResponse(
            RecurringTransactionResource::collection($result['data'] ?? $result),
            $result['total'] ?? count($result['data'] ?? $result),
            $result['current_page'] ?? 1,
            $result['per_page'] ?? 15
        );
    }

    public function store(StoreRecurringTransactionRequest $request, CreateRecurringTransactionAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $transaction = RecurringTransaction::find($result['id'] ?? $result);
        return $this->successResponse(new RecurringTransactionResource($transaction), 'تم إنشاء الحركة الدورية بنجاح', 201);
    }

    public function update(StoreRecurringTransactionRequest $request, int $id, UpdateRecurringTransactionAction $action): JsonResponse
    {
        $result = $action->execute($id, $request->validated());
        $transaction = RecurringTransaction::find($result['id'] ?? $id);
        return $this->successResponse(new RecurringTransactionResource($transaction), 'تم تحديث الحركة الدورية بنجاح');
    }

    public function destroy(int $id, DeleteRecurringTransactionAction $action): JsonResponse
    {
        $action->execute($id);
        return $this->successResponse([], 'تم حذف الحركة الدورية بنجاح');
    }

    public function process(ProcessRecurringTransactionRequest $request, ProcessRecurringTransactionAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $transaction = RecurringTransaction::find($result['id'] ?? $result);
        return $this->successResponse(new RecurringTransactionResource($transaction), 'تم معالجة الحركة الدورية بنجاح');
    }
}
