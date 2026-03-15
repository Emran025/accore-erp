<?php

namespace App\Http\Controllers\Api\V2\Finance\Treasury;

use App\Http\Controllers\Controller;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Finance\Treasury\StoreReconciliationRequest;
use App\Http\Requests\Finance\Treasury\UpdateReconciliationRequest;
use App\Domains\Finance\Treasury\Models\Reconciliation;
use App\Http\Resources\Finance\Treasury\ReconciliationResource;
use App\Domains\Finance\Treasury\Actions\ListReconciliationsAction;
use App\Domains\Finance\Treasury\Actions\CreateReconciliationAction;
use App\Domains\Finance\Treasury\Actions\UpdateReconciliationAction;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class BankReconciliationController extends Controller
{
    use BaseApiController;

    public function __construct(
        protected LedgerService $ledgerService
    ) {}

    /**
     * Get all reconciliations or calculate ledger balance
     */
    public function index(Request $request, ListReconciliationsAction $action): JsonResponse
    {
        PermissionService::requirePermission('reconciliations', 'view');
        $subAction = $request->query('action');
        
        if ($subAction === 'calculate') {
            $date = $request->query('date', now()->format('Y-m-d'));
            $accountCode = $request->query('account_code', '1110');
            $balance = $this->ledgerService->getAccountBalance($accountCode, $date);
            return $this->successResponse(['ledger_balance' => $balance]);
        }

        $result = $action->execute($request->all());

        return $this->paginatedResponse(
            ReconciliationResource::collection($result['data']),
            $result['total'] ?? count($result['data']),
            $result['current_page'] ?? 1,
            $result['per_page'] ?? 15
        );
    }

    /**
     * Create a new reconciliation
     */
    public function store(StoreReconciliationRequest $request, CreateReconciliationAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('reconciliations', 'create');
            $result = $action->execute($request->validated());
            $reconciliation = Reconciliation::find($result['id'] ?? $result);
            return $this->successResponse(new ReconciliationResource($reconciliation), 'Reconciliation created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Update a reconciliation or post an adjustment
     */
    public function update(UpdateReconciliationRequest $request, UpdateReconciliationAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('reconciliations', 'update');
            $result = $action->execute($request->validated());
            $reconciliation = Reconciliation::find($result['id'] ?? $result);
            return $this->successResponse(new ReconciliationResource($reconciliation), 'Reconciliation updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}

