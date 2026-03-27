<?php

namespace App\Http\Controllers\Api\V2\SupplyChain\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplyChain\Inventory\ListBatchesRequest;
use App\Http\Requests\SupplyChain\Inventory\StoreBatchRequest;
use App\Http\Requests\SupplyChain\Inventory\DeleteBatchRequest;
use App\Domains\SupplyChain\Inventory\Actions\ListBatchProcessesAction;
use App\Domains\SupplyChain\Inventory\Actions\CreateBatchProcessAction;
use App\Domains\SupplyChain\Inventory\Actions\DeleteBatchProcessAction;
use App\Domains\SupplyChain\Inventory\Actions\ShowBatchProcessAction;
use App\Domains\SupplyChain\Inventory\Actions\ExecuteBatchProcessAction;
use App\Http\Resources\SupplyChain\Inventory\BatchResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class BatchController extends Controller
{
    use BaseApiController;

    public function index(ListBatchesRequest $request, ListBatchProcessesAction $listAction): JsonResponse
    {
        $paginator = $listAction->execute($request->validated());
        return $this->successResponse(BatchResource::collection($paginator));
    }

    public function store(StoreBatchRequest $request, CreateBatchProcessAction $createAction): JsonResponse
    {
        try {
            $batch = $createAction->execute($request->validated());
            return $this->successResponse(new BatchResource($batch), 'Batch created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function execute(int $id, ExecuteBatchProcessAction $executeAction): JsonResponse
    {
        try {
            $executeAction->execute($id);
            return $this->successResponse([], 'تم تنفيذ الدفعة بنجاح');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function show(int $batchId, ShowBatchProcessAction $action): JsonResponse
    {
        try {
            $batch = $action->execute($batchId);
            return $this->successResponse(new BatchResource($batch));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    public function destroy(DeleteBatchRequest $request, int $id, DeleteBatchProcessAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'تم حذف الدفعة بنجاح');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
