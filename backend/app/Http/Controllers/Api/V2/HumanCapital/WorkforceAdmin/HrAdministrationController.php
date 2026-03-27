<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListJobTitlesRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListPositionsRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreJobTitleRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateJobTitleRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StorePositionRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdatePositionRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\AssignEmployeeToPositionRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StorePermissionTemplateRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdatePermissionTemplateRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ApplyTemplateToRoleRequest;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListJobTitlesAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateJobTitleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateJobTitleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\DeleteJobTitleAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListPositionsAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowPositionAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreatePositionAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdatePositionAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\DeletePositionAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\AssignEmployeePositionAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UnassignEmployeePositionAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListPermissionTemplatesAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\CreatePermissionTemplateAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\UpdatePermissionTemplateAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ApplyPermissionTemplateAction;
use App\Domains\HumanCapital\WorkforceAdmin\Models\JobTitle;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\EnterpriseCore\IdentityAccess\Models\PermissionTemplate;
use App\Http\Resources\HumanCapital\WorkforceAdmin\JobTitleResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\PositionResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\EmployeeResource;
use App\Http\Resources\EnterpriseCore\IdentityAccess\PermissionTemplateResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class HrAdministrationController extends Controller
{
    use BaseApiController;

    // ══════════════════════════════════════════════════════
    // Job Titles
    // ══════════════════════════════════════════════════════

    public function indexJobTitles(ListJobTitlesRequest $request, ListJobTitlesAction $action): JsonResponse
    {
        $titles = $action->execute($request->validated());
        $data = $titles['data'] ?? $titles;

        return $this->paginatedResponse(
            JobTitleResource::collection($data)->resolve(),
            $titles['total'] ?? (is_countable($data) ? count($data) : 0),
            $titles['current_page'] ?? 1,
            $titles['per_page'] ?? 15
        );
    }

    public function storeJobTitle(StoreJobTitleRequest $request, CreateJobTitleAction $action): JsonResponse
    {
        try {
            $title = $action->execute($request->validated());
            return $this->successResponse(new JobTitleResource($title), 'Job title created');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateJobTitle(UpdateJobTitleRequest $request, $id, UpdateJobTitleAction $action): JsonResponse
    {
        try {
            $result = $action->execute($id, $request->validated());
            
            return $this->successResponse(
                new JobTitleResource($result['title']),
                "تم تحديث المسمى الوظيفي — " . ($result['positions_synced'] ?? 0) . " منصب و " . ($result['employees_synced'] ?? 0) . " موظف تم مزامنتهم"
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroyJobTitle($id, DeleteJobTitleAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Job title deleted');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ══════════════════════════════════════════════════════
    // Positions Management
    // ══════════════════════════════════════════════════════

    public function indexPositions(ListPositionsRequest $request, ListPositionsAction $action): JsonResponse
    {
        $positions = $action->execute($request->validated());
        $data = $positions['data'] ?? $positions;

        return $this->paginatedResponse(
            PositionResource::collection($data)->resolve(),
            $positions['total'] ?? (is_countable($data) ? count($data) : 0),
            $positions['current_page'] ?? 1,
            $positions['per_page'] ?? 15
        );
    }

    public function showPosition($id, ShowPositionAction $action): JsonResponse
    {
        $position = $action->execute($id);
        return $this->successResponse(new PositionResource($position));
    }

    public function storePosition(StorePositionRequest $request, CreatePositionAction $action): JsonResponse
    {
        try {
            $position = $action->execute($request->validated());
            return $this->successResponse(new PositionResource($position), 'Position created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updatePosition(UpdatePositionRequest $request, $id, UpdatePositionAction $action): JsonResponse
    {
        try {
            $position = $action->execute($id, $request->validated());
            return $this->successResponse(new PositionResource($position), 'Position updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroyPosition($id, DeletePositionAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Position deleted');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function assignEmployeeToPosition(AssignEmployeeToPositionRequest $request, AssignEmployeePositionAction $action): JsonResponse
    {
        try {
            $employee = $action->execute($request->validated());
            return $this->successResponse(new EmployeeResource($employee), 'Employee assigned to position successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function unassignEmployeeFromPosition($employeeId, UnassignEmployeePositionAction $action): JsonResponse
    {
        try {
            $action->execute($employeeId);
            return $this->successResponse([], 'Employee removed from position');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ══════════════════════════════════════════════════════
    // Permission Templates
    // ══════════════════════════════════════════════════════

    public function indexTemplates(ListPermissionTemplatesAction $action): JsonResponse
    {
        $templates = $action->execute();
        return $this->successResponse(PermissionTemplateResource::collection($templates)->resolve());
    }

    public function storeTemplate(StorePermissionTemplateRequest $request, CreatePermissionTemplateAction $action): JsonResponse
    {
        try {
            $template = $action->execute($request->validated());
            return $this->successResponse(new PermissionTemplateResource($template), 'Permission template created');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateTemplate(UpdatePermissionTemplateRequest $request, $id, UpdatePermissionTemplateAction $action): JsonResponse
    {
        try {
            $template = $action->execute($id, $request->validated());
            return $this->successResponse(new PermissionTemplateResource($template), 'Permission template updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function applyTemplateToRole(ApplyTemplateToRoleRequest $request, ApplyPermissionTemplateAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $action->execute($validated);
            return $this->successResponse([], 'Template applied to role');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
