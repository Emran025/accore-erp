<?php

namespace App\Http\Controllers\Api\V2\Finance\CostProfitCenters;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Finance\CostProfitCenters\StoreCostCenterRequest;
use App\Http\Requests\Finance\CostProfitCenters\UpdateCostCenterRequest;
use App\Http\Requests\Finance\CostProfitCenters\StoreProfitCenterRequest;
use App\Http\Requests\Finance\CostProfitCenters\UpdateProfitCenterRequest;
use App\Domains\Finance\CostProfitCenters\Actions\ListCostCentersAction;
use App\Domains\Finance\CostProfitCenters\Actions\GetCostCentersTreeAction;
use App\Domains\Finance\CostProfitCenters\Actions\CreateCostCenterAction;
use App\Domains\Finance\CostProfitCenters\Actions\ShowCostCenterAction;
use App\Domains\Finance\CostProfitCenters\Actions\UpdateCostCenterAction;
use App\Domains\Finance\CostProfitCenters\Actions\DeleteCostCenterAction;
use App\Domains\Finance\CostProfitCenters\Actions\ListProfitCentersAction;
use App\Domains\Finance\CostProfitCenters\Actions\GetProfitCentersTreeAction;
use App\Domains\Finance\CostProfitCenters\Actions\CreateProfitCenterAction;
use App\Domains\Finance\CostProfitCenters\Actions\ShowProfitCenterAction;
use App\Domains\Finance\CostProfitCenters\Actions\UpdateProfitCenterAction;
use App\Domains\Finance\CostProfitCenters\Actions\DeleteProfitCenterAction;
use App\Domains\Finance\CostProfitCenters\Actions\GetCentersSummaryAction;

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
            $result['items'],
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
            return $this->successResponse([
                'id'        => $result['id'],
                'node_uuid' => $result['node_uuid'],
            ], 'Cost center created and linked to organizational structure');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Show a single cost centre.
     */
    public function costCentersShow(int $id, ShowCostCenterAction $action): JsonResponse
    {
        return $this->successResponse(['cost_center' => $action->execute($id)]);
    }

    /**
     * Update cost centre.
     */
    public function costCentersUpdate(UpdateCostCenterRequest $request, int $id, UpdateCostCenterAction $action): JsonResponse
    {
        try {
            $action->execute($request->validated(), $id);
            return $this->successResponse([], 'Cost center and organizational structure updated');
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
            $result['items'],
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
            return $this->successResponse([
                'id'        => $result['id'],
                'node_uuid' => $result['node_uuid'],
            ], 'Profit center created and linked to organizational structure');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Show a single profit centre.
     */
    public function profitCentersShow(int $id, ShowProfitCenterAction $action): JsonResponse
    {
        return $this->successResponse(['profit_center' => $action->execute($id)]);
    }

    /**
     * Update profit centre.
     */
    public function profitCentersUpdate(UpdateProfitCenterRequest $request, int $id, UpdateProfitCenterAction $action): JsonResponse
    {
        try {
            $action->execute($request->validated(), $id);
            return $this->successResponse([], 'Profit center and organizational structure updated');
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
