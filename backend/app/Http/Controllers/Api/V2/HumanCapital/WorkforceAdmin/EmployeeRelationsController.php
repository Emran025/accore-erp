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
        return $this->successResponse($result);
    }

    public function store(StoreRelationsCaseRequest $request, CreateRelationsCaseAction $action): JsonResponse
    {
        $case = $action->execute($request->validated());
        return response()->json(array_merge(['success' => true], $case), 201);
    }

    public function show($id, ShowRelationsCaseAction $action): JsonResponse
    {
        try {
            $case = $action->execute((int)$id);
            return $this->successResponse($case);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 404);
        }
    }

    public function update(UpdateRelationsCaseRequest $request, $id, UpdateRelationsCaseAction $action): JsonResponse
    {
        $case = $action->execute((int)$id, $request->validated());
        return $this->successResponse($case);
    }

    public function storeDisciplinaryAction(StoreDisciplinaryActionRequest $request, $caseId, CreateDisciplinaryActionAction $action): JsonResponse
    {
        $disciplinaryAction = $action->execute((int)$caseId, $request->validated());
        return response()->json(array_merge(['success' => true], $disciplinaryAction), 201);
    }
}
