<?php

namespace App\Http\Controllers\Api\V2\Finance\ManagementAccounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Finance\ManagementAccounting\StoreRevenueRequest;
use App\Http\Requests\Finance\ManagementAccounting\UpdateRevenueRequest;
use App\Http\Requests\Finance\ManagementAccounting\RevenueIdRequest;
use App\Domains\Finance\ManagementAccounting\Actions\ListRevenuesAction;
use App\Domains\Finance\ManagementAccounting\Actions\CreateRevenueAction;
use App\Domains\Finance\ManagementAccounting\Actions\UpdateRevenueAction;
use App\Domains\Finance\ManagementAccounting\Actions\DeleteRevenueAction;

class RevenuesController extends Controller
{
    use BaseApiController;

    /**
     * List all revenues
     */
    public function index(Request $request, ListRevenuesAction $action): JsonResponse
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
     * Store a new revenue record
     */
    public function store(StoreRevenueRequest $request, CreateRevenueAction $action): JsonResponse
    {
        try {
            return $this->successResponse($action->execute($request->validated()));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Update revenue record
     */
    public function update(UpdateRevenueRequest $request, UpdateRevenueAction $action): JsonResponse
    {
        try {
            $action->execute($request->validated());
            return $this->successResponse([], 'Revenue record updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Delete revenue record
     */
    public function destroy(RevenueIdRequest $request, DeleteRevenueAction $action): JsonResponse
    {
        try {
            $action->execute((int)$request->input('id'));
            return $this->successResponse([], 'Revenue record deleted and GL entries reversed');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
