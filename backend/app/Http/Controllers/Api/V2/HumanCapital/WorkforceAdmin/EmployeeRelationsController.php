<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreRelationsCaseRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateRelationsCaseRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreDisciplinaryActionRequest;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListRelationsCasesAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateRelationsCaseAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowRelationsCaseAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateRelationsCaseAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateDisciplinaryActionAction;
use App\Http\Resources\HumanCapital\WorkforceAdmin\EmployeeRelationsCaseResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\DisciplinaryActionResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class EmployeeRelationsController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListRelationsCasesAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(EmployeeRelationsCaseResource::collection($paginator));
    }

    public function store(StoreRelationsCaseRequest $request, CreateRelationsCaseAction $action): JsonResponse
    {
        $case = $action->execute($request->validated());
        return $this->successResponse(new EmployeeRelationsCaseResource($case), 'Relations case created successfully', 201);
    }

    public function show($id, ShowRelationsCaseAction $action): JsonResponse
    {
        try {
            $case = $action->execute((int)$id);
            return $this->successResponse(new EmployeeRelationsCaseResource($case));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 404);
        }
    }

    public function update(UpdateRelationsCaseRequest $request, $id, UpdateRelationsCaseAction $action): JsonResponse
    {
        $case = $action->execute((int)$id, $request->validated());
        return $this->successResponse(new EmployeeRelationsCaseResource($case), 'Relations case updated successfully');
    }

    public function storeDisciplinaryAction(StoreDisciplinaryActionRequest $request, $caseId, CreateDisciplinaryActionAction $action): JsonResponse
    {
        $disciplinaryAction = $action->execute((int)$caseId, $request->validated());
        return $this->successResponse(new DisciplinaryActionResource($disciplinaryAction), 'Disciplinary action recorded successfully', 201);
    }
}
