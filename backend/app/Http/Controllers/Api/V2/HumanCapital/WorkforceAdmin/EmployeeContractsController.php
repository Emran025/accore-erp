<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreEmployeeContractRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateEmployeeContractRequest;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListContractsAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateContractAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowContractAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateContractAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\DeleteContractAction;
use App\Http\Resources\HumanCapital\WorkforceAdmin\EmployeeContractResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class EmployeeContractsController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListContractsAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(EmployeeContractResource::collection($paginator));
    }

    public function store(StoreEmployeeContractRequest $request, CreateContractAction $action): JsonResponse
    {
        $contract = $action->execute($request->validated());
        return $this->successResponse(new EmployeeContractResource($contract), 'Contract created successfully', 201);
    }

    public function show($id, ShowContractAction $action): JsonResponse
    {
        $contract = $action->execute((int)$id);
        return $this->successResponse(new EmployeeContractResource($contract));
    }

    public function update(UpdateEmployeeContractRequest $request, $id, UpdateContractAction $action): JsonResponse
    {
        $contract = $action->execute((int)$id, $request->validated());
        return $this->successResponse(new EmployeeContractResource($contract), 'Contract updated successfully');
    }

    public function destroy($id, DeleteContractAction $action): JsonResponse
    {
        $action->execute((int)$id);
        return $this->successResponse([], 'Contract deleted successfully');
    }
}
