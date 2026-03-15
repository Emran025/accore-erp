<?php

namespace App\Http\Controllers\Api\V2\Platform\Automation;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\EnterpriseCore\Automation\Actions\ListRecurringTransactionsAction;
use App\Domains\EnterpriseCore\Automation\Actions\CreateRecurringTransactionAction;
use App\Domains\EnterpriseCore\Automation\Actions\UpdateRecurringTransactionAction;
use App\Domains\EnterpriseCore\Automation\Actions\DeleteRecurringTransactionAction;
use App\Domains\EnterpriseCore\Automation\Actions\ProcessRecurringTransactionAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Requests\Platform\Automation\StoreRecurringTransactionRequest;
use App\Http\Requests\Platform\Automation\ProcessRecurringTransactionRequest;

class RecurringTransactionController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListRecurringTransactionsAction $action): JsonResponse
    {
        $result = $action->execute($request->all());
        return $this->successResponse($result);
    }

    public function store(StoreRecurringTransactionRequest $request, CreateRecurringTransactionAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'تم إنشاء الحركة الدورية بنجاح');
    }

    public function update(StoreRecurringTransactionRequest $request, int $id, UpdateRecurringTransactionAction $action): JsonResponse
    {
        $result = $action->execute($id, $request->validated());
        return $this->successResponse($result, 'تم تحديث الحركة الدورية بنجاح');
    }

    public function destroy(int $id, DeleteRecurringTransactionAction $action): JsonResponse
    {
        $action->execute($id);
        return $this->successResponse([], 'تم حذف الحركة الدورية بنجاح');
    }

    public function process(ProcessRecurringTransactionRequest $request, ProcessRecurringTransactionAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'تم معالجة الحركة الدورية بنجاح');
    }
}
