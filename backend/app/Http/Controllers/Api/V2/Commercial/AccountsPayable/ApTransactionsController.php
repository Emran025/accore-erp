<?php

namespace App\Http\Controllers\Api\V2\Commercial\AccountsPayable;

use App\Http\Controllers\Controller;
use App\Domains\Commercial\AccountsPayable\Actions\ListApTransactionsAction;
use App\Domains\Commercial\AccountsPayable\Actions\CreateApTransactionAction;
use App\Domains\Commercial\AccountsPayable\Actions\RecordApPaymentAction;
use App\Domains\Commercial\AccountsPayable\Actions\UpdateApTransactionAction;
use App\Domains\Commercial\AccountsPayable\Actions\DeleteApTransactionAction;
use App\Http\Requests\Commercial\AccountsPayable\ListApTransactionsRequest;
use App\Http\Requests\Commercial\AccountsPayable\StoreApTransactionRequest;
use App\Http\Requests\Commercial\AccountsPayable\RecordApPaymentRequest;
use App\Http\Requests\Commercial\AccountsPayable\UpdateApTransactionRequest;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use App\Http\Resources\ApTransactionResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

/**
 * AP Transactions Controller — Financial transactions for Accounts Payable.
 * Amounts are derived from the General Ledger (Single Source of Truth).
 */
class ApTransactionsController extends Controller
{
    use BaseApiController;

    /**
     * List AP transactions.
     */
    public function index(ListApTransactionsRequest $request, ListApTransactionsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            ApTransactionResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    /**
     * Store a new AP transaction (e.g. Manual Invoice).
     */
    public function store(StoreApTransactionRequest $request, CreateApTransactionAction $action): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id() ?? session('user_id');

        try {
            $transaction = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'ap_transactions', $transaction->id, null, $validated);

            return $this->successResponse(
                new ApTransactionResource($transaction),
                'AP Transaction recorded successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Record a supplier payment.
     */
    public function recordPayment(RecordApPaymentRequest $request, RecordApPaymentAction $action): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id() ?? session('user_id');

        try {
            $transaction = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'ap_payments', $transaction->id, null, $validated);

            return $this->successResponse(
                new ApTransactionResource($transaction),
                'Payment recorded successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Update an AP transaction.
     */
    public function update(UpdateApTransactionRequest $request, UpdateApTransactionAction $action): JsonResponse
    {
        $validated = $request->validated();

        try {
            $transaction = $action->execute($validated);
            TelescopeService::logOperation('UPDATE', 'ap_transactions', $transaction->id, null, $validated);

            return $this->successResponse(
                new ApTransactionResource($transaction),
                'Transaction updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Void/Delete an AP transaction.
     */
    public function destroy(int $id, DeleteApTransactionAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            TelescopeService::logOperation('DELETE', 'ap_transactions', $id, null, ['action' => 'void']);

            return $this->successResponse([], 'Transaction voided successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}