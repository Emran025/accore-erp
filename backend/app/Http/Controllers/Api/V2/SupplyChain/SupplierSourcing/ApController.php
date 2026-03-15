<?php

namespace App\Http\Controllers\Api\V2\SupplyChain\SupplierSourcing;

use App\Domains\SupplyChain\SupplierSourcing\Actions\ListSuppliersAction;
use App\Domains\SupplyChain\SupplierSourcing\Actions\CreateSupplierAction;
use App\Domains\SupplyChain\SupplierSourcing\Actions\UpdateSupplierAction;
use App\Domains\SupplyChain\SupplierSourcing\Actions\DeleteSupplierAction;
use App\Domains\SupplyChain\SupplierSourcing\Actions\SupplierLedgerAction;
use App\Http\Requests\SupplyChain\SupplierSourcing\ListSuppliersRequest;
use App\Http\Requests\SupplyChain\SupplierSourcing\StoreSupplierRequest;
use App\Http\Requests\SupplyChain\SupplierSourcing\UpdateSupplierRequest;
use App\Http\Requests\SupplyChain\SupplierSourcing\SupplierLedgerRequest;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Http\Resources\SupplyChain\SupplierSourcing\ApSupplierResource;
use App\Http\Resources\SupplyChain\PayablesExpenses\ApTransactionResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use App\Domains\SupplyChain\SupplierSourcing\Models\ApSupplier;
use App\Http\Controllers\Controller;

class ApController extends Controller
{
    use BaseApiController;

    private LedgerService $ledgerService;
    private ChartOfAccountsMappingService $coaService;

    public function __construct(
        LedgerService $ledgerService,
        ChartOfAccountsMappingService $coaService
    ) {
        $this->ledgerService = $ledgerService;
        $this->coaService = $coaService;
    }

    /**
     * Get suppliers
     */
    public function suppliers(ListSuppliersRequest $request, ListSuppliersAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            ApSupplierResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    /**
     * Create supplier
     */
    public function storeSupplier(StoreSupplierRequest $request, CreateSupplierAction $action): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id() ?? session('user_id');

        try {
            $result = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'ap_suppliers', $result['id'], null, $validated);

            $supplier = ApSupplier::find($result['id']);
            return $this->successResponse(new ApSupplierResource($supplier), 'Supplier created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    /**
     * Update supplier
     */
    public function updateSupplier(UpdateSupplierRequest $request, UpdateSupplierAction $action): JsonResponse
    {
        $validated = $request->validated();

        try {
            $result = $action->execute($validated);
            TelescopeService::logOperation('UPDATE', 'ap_suppliers', $result['id'], $result['old_values'], $validated);

            $supplier = ApSupplier::find($result['id']);
            return $this->successResponse(new ApSupplierResource($supplier), 'Supplier updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Delete supplier
     */
    public function destroySupplier(Request $request, DeleteSupplierAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        try {
            $oldValues = $action->execute((int)$id);
            TelescopeService::logOperation('DELETE', 'ap_suppliers', $id, $oldValues, null);

            return $this->successResponse([], 'Supplier deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    /**
     * Get supplier ledger with aging
     */
    public function supplierLedger(SupplierLedgerRequest $request, SupplierLedgerAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->successResponse([
            'supplier' => $result['supplier'],
            'aging' => $result['aging'],
            'data' => ApTransactionResource::collection($result['data']),
            'stats' => $result['stats'],
            'pagination' => $result['pagination'],
        ]);
    }
}