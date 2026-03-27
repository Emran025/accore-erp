<?php

namespace App\Http\Controllers\Api\V2\Commercial\RevenueReceivables;

use App\Domains\Commercial\RevenueReceivables\Actions\ListArTransactionsAction;
use App\Domains\Commercial\RevenueReceivables\Actions\CreateArTransactionAction;
use App\Domains\Commercial\RevenueReceivables\Actions\DeleteArTransactionAction;
use App\Http\Requests\Commercial\RevenueReceivables\ListArTransactionsRequest;
use App\Http\Requests\Commercial\RevenueReceivables\StoreArTransactionRequest;
use App\Http\Requests\Commercial\RevenueReceivables\DeleteArTransactionRequest;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Http\Resources\Commercial\RevenueReceivables\ArTransactionResource;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

/**
 * AR Transactions Controller — Financial transactions for Accounts Receivable.
 * Amounts are derived from the General Ledger (Single Source of Truth).
 */
class ArTransactionsController extends Controller
{
    use BaseApiController;

    /**
     * List AR transactions.
     */
    public function index(ListArTransactionsRequest $request, ListArTransactionsAction $action): JsonResponse
    {
        $paginator = $action->execute($request->validated());

        return $this->paginatedResponse(
            ArTransactionResource::collection($paginator),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    /**
     * Store a new AR transaction (e.g. Manual Receipt/Return).
     */
    public function store(StoreArTransactionRequest $request, CreateArTransactionAction $action): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id() ?? session('user_id');

        try {
            $transaction = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'ar_transactions', $transaction->id, null, $validated);

            return $this->successResponse(
                new ArTransactionResource($transaction),
                'AR Transaction recorded successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Void/Delete an AR transaction.
     */
    public function destroy(DeleteArTransactionRequest $request, DeleteArTransactionAction $action): JsonResponse
    {
        try {
            $id = (int)$request->validated()['id'];
            $action->execute($id);
            TelescopeService::logOperation('DELETE', 'ar_transactions', $id, null, ['action' => 'void']);

            return $this->successResponse([], 'AR Transaction voided successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}