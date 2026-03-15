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
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Http\Resources\SalesRepresentativeResource;
use App\Http\Resources\SalesRepresentativeTransactionResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Support\Facades\Log;

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
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            SalesRepresentativeResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
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

            return $this->successResponse(['id' => $representative->id], 'Sales Representative created successfully');
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
            $result = $action->execute($validated);
            TelescopeService::logOperation('UPDATE', 'sales_representatives', $result['id'], $result['old_values'], $validated);

            return $this->successResponse([], 'Sales Representative updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    /**
     * Delete a sales representative.
     */
    public function destroyRepresentative(Request $request, DeleteSalesRepresentativeAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        try {
            $oldValues = $action->execute((int)$id);
            TelescopeService::logOperation('DELETE', 'sales_representatives', $id, $oldValues, null);

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

        return $this->successResponse([
            'representative' => $result['representative'],
            'data' => SalesRepresentativeTransactionResource::collection($result['data']),
            'stats' => $result['stats'],
            'pagination' => $result['pagination'],
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
            $result = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'sales_representative_transactions', $result['id'], null, $validated);

            return $this->successResponse($result, 'Transaction recorded successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Delete/Void a representative transaction.
     */
    public function destroyTransaction(Request $request, DeleteSalesRepresentativeTransactionAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        try {
            $oldValues = $action->execute((int)$id);
            TelescopeService::logOperation('DELETE', 'sales_representative_transactions', $id, $oldValues, null);

            return $this->successResponse([], 'Transaction voided successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}