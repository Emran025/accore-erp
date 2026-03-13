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
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class ContingentWorkersController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListContingentWorkersAction $action)
    {
        $filters = $request->only(['worker_type', 'status', 'search']);
        $workers = $action->execute($filters);

        return $this->successResponse($workers);
    }

    public function store(StoreContingentWorkerRequest $request, CreateContingentWorkerAction $action)
    {
        $validated = $request->validated();
        $worker = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $worker), 201);
    }

    public function show($id, ShowContingentWorkerAction $action)
    {
        $worker = $action->execute($id);
        return $this->successResponse($worker);
    }

    public function update(UpdateContingentWorkerRequest $request, $id, UpdateContingentWorkerAction $action)
    {
        $validated = $request->validated();
        $worker = $action->execute($id, $validated);

        return $this->successResponse($worker);
    }

    public function storeContract(StoreContingentContractRequest $request, $workerId, CreateContingentContractAction $action)
    {
        $validated = $request->validated();
        $contract = $action->execute($workerId, $validated);

        return response()->json(array_merge(['success' => true], $contract), 201);
    }
}
