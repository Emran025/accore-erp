<?php

namespace App\Http\Controllers\Api\V2\Finance\Treasury;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Finance\Treasury\StoreReconciliationRequest;
use App\Http\Requests\Finance\Treasury\UpdateReconciliationRequest;
use App\Http\Requests\Finance\Treasury\ListReconciliationsRequest;
use App\Http\Resources\Finance\Treasury\ReconciliationResource;
use App\Domains\Finance\Treasury\Actions\CalculateLedgerBalanceAction;
use App\Domains\Finance\Treasury\Actions\ListReconciliationsAction;
use App\Domains\Finance\Treasury\Actions\CreateReconciliationAction;
use App\Domains\Finance\Treasury\Actions\UpdateReconciliationAction;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class BankReconciliationController extends Controller
{
    use BaseApiController;

    /**
     * Get all reconciliations or calculate ledger balance
     */
    public function index(
        ListReconciliationsRequest $request, 
        ListReconciliationsAction $listAction,
        CalculateLedgerBalanceAction $calcAction
    ): JsonResponse {
        PermissionService::requirePermission('reconciliations', 'view');
        $validated = $request->validated();
        
        if (($validated['action'] ?? null) === 'calculate') {
            return $this->successResponse($calcAction->execute($validated));
        }

        $paginator = $listAction->execute($validated);

        return $this->successResponse(ReconciliationResource::collection($paginator));
    }

    /**
     * Create a new reconciliation
     */
    public function store(StoreReconciliationRequest $request, CreateReconciliationAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('reconciliations', 'create');
            $reconciliation = $action->execute($request->validated());
            return $this->successResponse(new ReconciliationResource($reconciliation), 'Reconciliation created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Update a reconciliation or post an adjustment
     */
    public function update(UpdateReconciliationRequest $request, int $id, UpdateReconciliationAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('reconciliations', 'update');
            $reconciliation = $action->execute($request->validated(), $id);
            return $this->successResponse(new ReconciliationResource($reconciliation), 'Reconciliation updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}

