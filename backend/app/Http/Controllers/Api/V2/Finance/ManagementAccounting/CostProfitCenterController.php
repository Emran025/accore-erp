<?php

namespace App\Http\Controllers\Api\V2\Finance\ManagementAccounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Finance\ManagementAccounting\StoreCostCenterRequest;
use App\Http\Requests\Finance\ManagementAccounting\UpdateCostCenterRequest;
use App\Http\Requests\Finance\ManagementAccounting\StoreProfitCenterRequest;
use App\Http\Requests\Finance\ManagementAccounting\UpdateProfitCenterRequest;
use App\Domains\Finance\ManagementAccounting\Actions\ListCostCentersAction;
use App\Domains\Finance\ManagementAccounting\Actions\GetCostCentersTreeAction;
use App\Domains\Finance\ManagementAccounting\Actions\CreateCostCenterAction;
use App\Domains\Finance\ManagementAccounting\Actions\ShowCostCenterAction;
use App\Domains\Finance\ManagementAccounting\Actions\UpdateCostCenterAction;
use App\Domains\Finance\ManagementAccounting\Actions\DeleteCostCenterAction;
use App\Domains\Finance\ManagementAccounting\Actions\ListProfitCentersAction;
use App\Domains\Finance\ManagementAccounting\Actions\GetProfitCentersTreeAction;
use App\Domains\Finance\ManagementAccounting\Actions\CreateProfitCenterAction;
use App\Domains\Finance\ManagementAccounting\Actions\ShowProfitCenterAction;
use App\Domains\Finance\ManagementAccounting\Actions\UpdateProfitCenterAction;
use App\Domains\Finance\ManagementAccounting\Actions\DeleteProfitCenterAction;
use App\Domains\Finance\ManagementAccounting\Actions\GetCentersSummaryAction;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Http\Resources\Finance\ManagementAccounting\CostCenterResource;
use App\Http\Resources\Finance\ManagementAccounting\ProfitCenterResource;

class CostProfitCenterController extends Controller
{
    use BaseApiController;

    // ═══════════════════════════════════════════════════════════════════
    // COST CENTERS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * List all cost centres
     */
    public function costCentersIndex(Request $request, ListCostCentersAction $action): JsonResponse
    {
        $result = $action->execute($request->all());
        return $this->paginatedResponse(
            CostCenterResource::collection($result['items']),
            $result['total'],
            $result['page'],
            $result['per_page']
        );
    }

    /**
     * Get full hierarchy tree for cost centres.
     */
    public function costCentersTree(GetCostCentersTreeAction $action): JsonResponse
    {
        return $this->successResponse(['tree' => $action->execute()]);
    }

    /**
     * Store a new cost centre.
     */
    public function costCentersStore(StoreCostCenterRequest $request, CreateCostCenterAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $costCenter = CostCenter::find($result['id'] ?? $result);
            return $this->successResponse(new CostCenterResource($costCenter), 'Cost center created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Show a single cost centre.
     */
    public function costCentersShow(int $id, ShowCostCenterAction $action): JsonResponse
    {
        $result = $action->execute($id);
        $costCenter = CostCenter::find($result['id'] ?? $id);
        return $this->successResponse(new CostCenterResource($costCenter));
    }

    /**
     * Update cost centre.
     */
    public function costCentersUpdate(UpdateCostCenterRequest $request, int $id, UpdateCostCenterAction $action): JsonResponse
    {
        try {
            $action->execute($request->validated(), $id);
            $costCenter = CostCenter::find($id);
            return $this->successResponse(new CostCenterResource($costCenter), 'Cost center updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Delete cost centre
     */
    public function costCentersDestroy(int $id, DeleteCostCenterAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Cost center deleted and organizational node archived');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PROFIT CENTERS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * List all profit centres
     */
    public function profitCentersIndex(Request $request, ListProfitCentersAction $action): JsonResponse
    {
        $result = $action->execute($request->all());
        return $this->paginatedResponse(
            ProfitCenterResource::collection($result['items']),
            $result['total'],
            $result['page'],
            $result['per_page']
        );
    }

    /**
     * Get full hierarchy tree for profit centres.
     */
    public function profitCentersTree(GetProfitCentersTreeAction $action): JsonResponse
    {
        return $this->successResponse(['tree' => $action->execute()]);
    }

    /**
     * Store a new profit centre.
     */
    public function profitCentersStore(StoreProfitCenterRequest $request, CreateProfitCenterAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $profitCenter = ProfitCenter::find($result['id'] ?? $result);
            return $this->successResponse(new ProfitCenterResource($profitCenter), 'Profit center created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Show a single profit centre.
     */
    public function profitCentersShow(int $id, ShowProfitCenterAction $action): JsonResponse
    {
        $result = $action->execute($id);
        $profitCenter = ProfitCenter::find($result['id'] ?? $id);
        return $this->successResponse(new ProfitCenterResource($profitCenter));
    }

    /**
     * Update profit centre.
     */
    public function profitCentersUpdate(UpdateProfitCenterRequest $request, int $id, UpdateProfitCenterAction $action): JsonResponse
    {
        try {
            $action->execute($request->validated(), $id);
            $profitCenter = ProfitCenter::find($id);
            return $this->successResponse(new ProfitCenterResource($profitCenter), 'Profit center updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Delete profit centre.
     */
    public function profitCentersDestroy(int $id, DeleteProfitCenterAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Profit center deleted and organizational node archived');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // ANALYTICS / SUMMARY
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Dashboard-style summary
     */
    public function summary(GetCentersSummaryAction $action): JsonResponse
    {
        return $this->successResponse($action->execute());
    }
}
