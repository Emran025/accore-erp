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
use App\Http\Resources\Finance\ManagementAccounting\RevenueResource;

class RevenuesController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListRevenuesAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->paginatedResponse(
            RevenueResource::collection($paginator->items())->resolve(),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    public function store(StoreRevenueRequest $request, CreateRevenueAction $action): JsonResponse
    {
        try {
            $revenue = $action->execute($request->validated());
            return $this->successResponse(new RevenueResource($revenue), 'Revenue recorded successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function update(UpdateRevenueRequest $request, int $id, UpdateRevenueAction $action): JsonResponse
    {
        try {
            $revenue = $action->execute(array_merge($request->validated(), ['id' => $id]));
            return $this->successResponse(new RevenueResource($revenue), 'Revenue record updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function destroy(RevenueIdRequest $request, int $id, DeleteRevenueAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Revenue record deleted and GL entries reversed');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
