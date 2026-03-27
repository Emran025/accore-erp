<?php

namespace App\Http\Controllers\Api\V2\Platform\Automation;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\EnterpriseCore\Automation\Actions\ListBatchesAction;
use App\Domains\EnterpriseCore\Automation\Actions\CreateBatchAction;
use App\Domains\EnterpriseCore\Automation\Actions\ShowBatchAction;
use App\Domains\EnterpriseCore\Automation\Actions\DeleteBatchAction;
use App\Domains\EnterpriseCore\Automation\Actions\ExecuteBatchAction;
use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Http\Resources\SupplyChain\Inventory\BatchResource;
use Illuminate\Http\JsonResponse;

use App\Http\Requests\Platform\Automation\ListBatchesRequest;
use App\Http\Requests\Platform\Automation\CreateBatchRequest;

class BatchController extends Controller
{
    use BaseApiController;

    public function index(ListBatchesRequest $request, ListBatchesAction $action): JsonResponse
    {
        $paginator = $action->execute($request->validated());
        return $this->paginatedResponse(
            BatchResource::collection($paginator),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    public function show(int $id, ShowBatchAction $action): JsonResponse
    {
        $batch = $action->execute($id);
        return $this->successResponse(new BatchResource($batch));
    }

    public function store(CreateBatchRequest $request, CreateBatchAction $action): JsonResponse
    {
        $batch = $action->execute($request->validated());
        return $this->successResponse(new BatchResource($batch), 'تم إنشاء الدفعة بنجاح', 201);
    }

    public function execute(int $id, ExecuteBatchAction $action): JsonResponse
    {
        try {
            $batch = $action->execute($id);
            return $this->successResponse(new BatchResource($batch), 'تم تنفيذ الدفعة بنجاح');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function destroy(int $id, DeleteBatchAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'تم حذف الدفعة بنجاح');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
