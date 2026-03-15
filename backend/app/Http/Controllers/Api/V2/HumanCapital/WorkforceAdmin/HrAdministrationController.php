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
        return $this->successResponse($titles);
    }

    public function storeJobTitle(StoreJobTitleRequest $request, CreateJobTitleAction $action): JsonResponse
    {
        $validated = $request->validated();
        $title = $action->execute($validated);

        return $this->successResponse($title, 'Job title created');
    }

    public function updateJobTitle(UpdateJobTitleRequest $request, $id, UpdateJobTitleAction $action): JsonResponse
    {
        $validated = $request->validated();
        
        $result = $action->execute($id, $validated);

        return $this->successResponse(
            $result['title'],
            "تم تحديث المسمى الوظيفي — {$result['positions_synced']} منصب و {$result['employees_synced']} موظف تم مزامنتهم"
        );
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
        return $this->successResponse($positions);
    }

    public function showPosition($id, ShowPositionAction $action): JsonResponse
    {
        $position = $action->execute($id);

        return $this->successResponse($position);
    }

    public function storePosition(StorePositionRequest $request, CreatePositionAction $action): JsonResponse
    {
        $validated = $request->validated();
        $position = $action->execute($validated);

        return $this->successResponse($position, 'Position created successfully');
    }

    public function updatePosition(UpdatePositionRequest $request, $id, UpdatePositionAction $action): JsonResponse
    {
        $validated = $request->validated();
        $position = $action->execute($id, $validated);

        return $this->successResponse($position, 'Position updated successfully');
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
        $validated = $request->validated();
        $employee = $action->execute($validated);

        return $this->successResponse($employee, 'Employee assigned to position successfully');
    }

    public function unassignEmployeeFromPosition($employeeId, UnassignEmployeePositionAction $action): JsonResponse
    {
        $action->execute($employeeId);

        return $this->successResponse([], 'Employee removed from position');
    }

    // ══════════════════════════════════════════════════════
    // Permission Templates
    // ══════════════════════════════════════════════════════

    public function indexTemplates(ListPermissionTemplatesAction $action): JsonResponse
    {
        $templates = $action->execute();
        return $this->successResponse($templates);
    }

    public function storeTemplate(StorePermissionTemplateRequest $request, CreatePermissionTemplateAction $action): JsonResponse
    {
        $validated = $request->validated();
        $template = $action->execute($validated);

        return $this->successResponse($template, 'Permission template created');
    }

    public function updateTemplate(UpdatePermissionTemplateRequest $request, $id, UpdatePermissionTemplateAction $action): JsonResponse
    {
        $validated = $request->validated();
        $template = $action->execute($id, $validated);

        return $this->successResponse($template, 'Permission template updated');
    }

    public function applyTemplateToRole(ApplyTemplateToRoleRequest $request, ApplyPermissionTemplateAction $action): JsonResponse
    {
        $validated = $request->validated();
        $action->execute($validated);

        return $this->successResponse([], 'Template applied to role');
    }
}
