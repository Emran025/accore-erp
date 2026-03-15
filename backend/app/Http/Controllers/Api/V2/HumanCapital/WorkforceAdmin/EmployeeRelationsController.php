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
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
use App\Domains\HumanCapital\WorkforceAdmin\Models\DisciplinaryAction;
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
        $filters = $request->only(['case_type', 'status', 'employee_id']);
        $result = $action->execute($filters);
        return $this->paginatedResponse(
            EmployeeRelationsCaseResource::collection($result['data'] ?? $result),
            $result['total'] ?? count($result['data'] ?? $result),
            $result['current_page'] ?? 1,
            $result['per_page'] ?? 15
        );
    }

    public function store(StoreRelationsCaseRequest $request, CreateRelationsCaseAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $case = EmployeeRelationsCase::find($result['id'] ?? $result);
        return $this->successResponse(new EmployeeRelationsCaseResource($case), 'Relations case created successfully', 201);
    }

    public function show($id, ShowRelationsCaseAction $action): JsonResponse
    {
        try {
            $result = $action->execute((int)$id);
            $case = EmployeeRelationsCase::find($result['id'] ?? $id);
            return $this->successResponse(new EmployeeRelationsCaseResource($case));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 404);
        }
    }

    public function update(UpdateRelationsCaseRequest $request, $id, UpdateRelationsCaseAction $action): JsonResponse
    {
        $result = $action->execute((int)$id, $request->validated());
        $case = EmployeeRelationsCase::find($result['id'] ?? $id);
        return $this->successResponse(new EmployeeRelationsCaseResource($case), 'Relations case updated successfully');
    }

    public function storeDisciplinaryAction(StoreDisciplinaryActionRequest $request, $caseId, CreateDisciplinaryActionAction $action): JsonResponse
    {
        $result = $action->execute((int)$caseId, $request->validated());
        $disciplinaryAction = DisciplinaryAction::find($result['id'] ?? $result);
        return $this->successResponse(new DisciplinaryActionResource($disciplinaryAction), 'Disciplinary action recorded successfully', 201);
    }
}
