<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\WorkforceAdmin\Models\ContingentWorker;
use App\Domains\HumanCapital\WorkforceAdmin\Models\ContingentContract;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreContingentWorkerRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateContingentWorkerRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreContingentContractRequest;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListContingentWorkersAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateContingentWorkerAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowContingentWorkerAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateContingentWorkerAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateContingentContractAction;
use App\Http\Resources\HumanCapital\WorkforceAdmin\ContingentWorkerResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\ContingentContractResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class ContingentWorkersController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListContingentWorkersAction $action)
    {
        $filters = $request->only(['worker_type', 'status', 'search']);
        $workers = $action->execute($filters);

        return $this->paginatedResponse(
            ContingentWorkerResource::collection($workers['data'] ?? $workers),
            $workers['total'] ?? count($workers['data'] ?? $workers),
            $workers['current_page'] ?? 1,
            $workers['per_page'] ?? 15
        );
    }

    public function store(StoreContingentWorkerRequest $request, CreateContingentWorkerAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $worker = ContingentWorker::find($result['id'] ?? $result);

        return $this->successResponse(new ContingentWorkerResource($worker), 'Contingent worker created successfully', 201);
    }

    public function show($id, ShowContingentWorkerAction $action)
    {
        $result = $action->execute($id);
        $worker = ContingentWorker::find($result['id'] ?? $id);
        return $this->successResponse(new ContingentWorkerResource($worker));
    }

    public function update(UpdateContingentWorkerRequest $request, $id, UpdateContingentWorkerAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($id, $validated);
        $worker = ContingentWorker::find($result['id'] ?? $id);

        return $this->successResponse(new ContingentWorkerResource($worker), 'Contingent worker updated successfully');
    }

    public function storeContract(StoreContingentContractRequest $request, $workerId, CreateContingentContractAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($workerId, $validated);
        $contract = ContingentContract::find($result['id'] ?? $result);

        return $this->successResponse(new ContingentContractResource($contract), 'Contingent contract created successfully', 201);
    }
}
