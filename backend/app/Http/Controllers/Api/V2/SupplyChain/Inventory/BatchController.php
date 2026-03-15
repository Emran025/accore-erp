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
use App\Domains\SupplyChain\Inventory\Models\Batch;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class BatchController extends Controller
{
    use BaseApiController;

    public function index(ListBatchesRequest $request, ListBatchProcessesAction $listAction, ShowBatchProcessAction $showAction): JsonResponse
    {
        if ($request->query('action') === 'status') {
            $batch = Batch::find((int)$request->query('batch_id'));
            return $this->successResponse(new BatchResource($batch));
        }

        $result = $listAction->execute($request->validated());
        
        return $this->paginatedResponse(
            BatchResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    public function store(StoreBatchRequest $request, CreateBatchProcessAction $createAction, ExecuteBatchProcessAction $executeAction): JsonResponse
    {
        if ($request->query('action')) {
            try {
                $executeAction->execute((int)$request->input('batch_id'));
                return $this->successResponse([], 'تم تنفيذ الدفعة بنجاح');
            } catch (\Exception $e) {
                return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
            }
        }

        $result = $createAction->execute($request->validated());
        $batch = Batch::find($result['id']);
        return $this->successResponse(new BatchResource($batch));
    }

    public function show(int $batchId, ShowBatchProcessAction $action): JsonResponse
    {
        $batch = Batch::find($batchId);
        return $this->successResponse(new BatchResource($batch));
    }

    public function destroy(DeleteBatchRequest $request, DeleteBatchProcessAction $action): JsonResponse
    {
        try {
            $action->execute((int)$request->input('id'));
            return $this->successResponse([], 'تم حذف الدفعة بنجاح');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
