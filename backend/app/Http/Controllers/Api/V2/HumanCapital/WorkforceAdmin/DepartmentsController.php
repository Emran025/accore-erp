<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListDepartmentsRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreDepartmentRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateDepartmentRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListDepartmentsAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateDepartmentAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowDepartmentAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateDepartmentAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\DeleteDepartmentAction;

class DepartmentsController extends Controller
{
    use BaseApiController;

    public function index(ListDepartmentsRequest $request, ListDepartmentsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result);
    }

    public function store(StoreDepartmentRequest $request, CreateDepartmentAction $action): JsonResponse
    {
        $department = $action->execute($request->validated());
        return $this->successResponse($department, 'Department created successfully', 201);
    }

    public function show($id, ShowDepartmentAction $action): JsonResponse
    {
        $department = $action->execute((int)$id);
        return $this->successResponse($department);
    }

    public function update(UpdateDepartmentRequest $request, $id, UpdateDepartmentAction $action): JsonResponse
    {
        $department = $action->execute((int)$id, $request->validated());
        return $this->successResponse($department, 'Department updated successfully');
    }

    public function destroy($id, DeleteDepartmentAction $action): JsonResponse
    {
        $action->execute((int)$id);
        return $this->successResponse([], 'Department deleted successfully');
    }
}
