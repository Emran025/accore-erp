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
use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;
use App\Http\Resources\HumanCapital\WorkforceAdmin\DepartmentResource;

class DepartmentsController extends Controller
{
    use BaseApiController;

    public function index(ListDepartmentsRequest $request, ListDepartmentsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse(DepartmentResource::collection($result)->resolve());
    }

    public function store(StoreDepartmentRequest $request, CreateDepartmentAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $department = Department::findOrFail($result['id'] ?? $result);
            return $this->successResponse((new DepartmentResource($department))->resolve(), 'Department created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show($id, ShowDepartmentAction $action): JsonResponse
    {
        $result = $action->execute((int)$id);
        $department = Department::findOrFail($result['id'] ?? $id);
        return $this->successResponse((new DepartmentResource($department))->resolve());
    }

    public function update(UpdateDepartmentRequest $request, $id, UpdateDepartmentAction $action): JsonResponse
    {
        try {
            $result = $action->execute((int)$id, $request->validated());
            $department = Department::findOrFail($result['id'] ?? $id);
            return $this->successResponse((new DepartmentResource($department))->resolve(), 'Department updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy($id, DeleteDepartmentAction $action): JsonResponse
    {
        $action->execute((int)$id);
        return $this->successResponse([], 'Department deleted successfully');
    }
}
