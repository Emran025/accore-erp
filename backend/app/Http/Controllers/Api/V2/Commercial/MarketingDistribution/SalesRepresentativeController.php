<?php

namespace App\Http\Controllers\Api\V2\Commercial\MarketingDistribution;

use App\Http\Controllers\Controller;
use App\Domains\Commercial\MarketingDistribution\Actions\ListSalesRepresentativesAction;
use App\Domains\Commercial\MarketingDistribution\Actions\CreateSalesRepresentativeAction;
use App\Domains\Commercial\MarketingDistribution\Actions\UpdateSalesRepresentativeAction;
use App\Domains\Commercial\MarketingDistribution\Actions\DeleteSalesRepresentativeAction;
use App\Domains\Commercial\MarketingDistribution\Actions\GetSalesRepresentativeLedgerAction;
use App\Domains\Commercial\MarketingDistribution\Actions\CreateSalesRepresentativeTransactionAction;
use App\Domains\Commercial\MarketingDistribution\Actions\DeleteSalesRepresentativeTransactionAction;
use App\Http\Requests\Commercial\MarketingDistribution\ListRepresentativesRequest;
use App\Http\Requests\Commercial\MarketingDistribution\StoreRepresentativeRequest;
use App\Http\Requests\Commercial\MarketingDistribution\UpdateRepresentativeRequest;
use App\Http\Requests\Commercial\MarketingDistribution\RepresentativeLedgerRequest;
use App\Http\Requests\Commercial\MarketingDistribution\StoreRepresentativeTransactionRequest;
use App\Http\Requests\Commercial\MarketingDistribution\DeleteRepresentativeRequest;
use App\Http\Requests\Commercial\MarketingDistribution\DeleteRepresentativeTransactionRequest;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Http\Resources\Commercial\MarketingDistribution\SalesRepresentativeResource;
use App\Http\Resources\Commercial\MarketingDistribution\SalesRepresentativeTransactionResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

/**
 * Controller for managing Sales Representatives via API.
 */
class SalesRepresentativeController extends Controller
{
    use BaseApiController;

    /**
     * List sales representatives.
     */
    public function representatives(ListRepresentativesRequest $request, ListSalesRepresentativesAction $action): JsonResponse
    {
        $paginator = $action->execute($request->validated());

        return $this->paginatedResponse(
            SalesRepresentativeResource::collection($paginator),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    /**
     * Create a new sales representative.
     */
    public function storeRepresentative(StoreRepresentativeRequest $request, CreateSalesRepresentativeAction $action): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id() ?? session('user_id');

        try {
            $representative = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'sales_representatives', $representative->id, null, $validated);

            return $this->successResponse(new SalesRepresentativeResource($representative), 'Sales Representative created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    /**
     * Update an existing sales representative.
     */
    public function updateRepresentative(UpdateRepresentativeRequest $request, UpdateSalesRepresentativeAction $action): JsonResponse
    {
        $validated = $request->validated();

        try {
            $representative = $action->execute($validated);
            // Assuming the action returns the updated model now or we need to adjust it
            // Let's check UpdateSalesRepresentativeAction first if possible, but standardizing here.
            return $this->successResponse(new SalesRepresentativeResource($representative), 'Sales Representative updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    /**
     * Delete a sales representative.
     */
    public function destroyRepresentative(DeleteRepresentativeRequest $request, DeleteSalesRepresentativeAction $action): JsonResponse
    {
        try {
            $id = (int)$request->validated()['id'];
            $oldValues = $action->execute($id);
            TelescopeService::logOperation('DELETE', 'sales_representatives', $id, $oldValues->toArray(), null);

            return $this->successResponse([], 'Sales Representative deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    /**
     * Get sales representative ledger/transactions.
     */
    public function ledger(RepresentativeLedgerRequest $request, GetSalesRepresentativeLedgerAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $paginator = $result['transactions'];

        return $this->successResponse([
            'representative' => $result['representative'],
            'data' => SalesRepresentativeTransactionResource::collection($paginator),
            'stats' => $result['stats'],
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total_records' => $paginator->total(),
                'total_pages' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Store a new representative transaction (e.g. Payment/Adjustment).
     */
    public function storeTransaction(StoreRepresentativeTransactionRequest $request, CreateSalesRepresentativeTransactionAction $action): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id() ?? session('user_id');

        try {
            $transaction = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'sales_representative_transactions', $transaction->id, null, $validated);

            return $this->successResponse(new SalesRepresentativeTransactionResource($transaction), 'Transaction recorded successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Delete/Void a representative transaction.
     */
    public function destroyTransaction(DeleteRepresentativeTransactionRequest $request, DeleteSalesRepresentativeTransactionAction $action): JsonResponse
    {
        try {
            $id = (int)$request->validated()['id'];
            $oldValues = $action->execute($id);
            TelescopeService::logOperation('DELETE', 'sales_representative_transactions', $id, $oldValues->toArray(), null);

            return $this->successResponse([], 'Transaction voided successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}